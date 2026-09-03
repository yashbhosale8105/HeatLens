"""Real Landsat Collection 2 Level-2 surface temperature for Thane.

Scenes are read straight from the Microsoft Planetary Computer STAC catalog,
which serves the USGS Landsat archive as cloud-optimised GeoTIFFs and needs no
account or API key. Only the Thane window of each scene is read, and the
result is cached in memory and on disk because a fetch takes tens of seconds.
"""

import json
import logging
import math
import threading
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
COLLECTION = "landsat-c2-l2"

# min_lon, min_lat, max_lon, max_lat - the Thane window the app shows.
THANE_BBOX = (72.925, 19.155, 73.045, 19.29)

# USGS Collection 2 Level-2 scaling.
ST_SCALE, ST_OFFSET = 0.00341802, 149.0
SR_SCALE, SR_OFFSET = 0.0000275, -0.2
ST_FILL_FLOOR = 293  # ST_B10 valid range starts here; the floor means "no retrieval".

# A scene is only used if it really covers Thane and enough pixels are usable.
MIN_COVERAGE = 0.98
MIN_USABLE = 0.40
MAX_CLOUD = 40
SEARCH_DAYS = 200
FALLBACK_SEARCH_DAYS = 500
MAX_SCREENED = 12  # bounds how many scenes we probe before choosing

CACHE_DIR = Path(__file__).resolve().parents[2] / ".cache"
SNAPSHOT_FILE = CACHE_DIR / "thane_landsat.npz"
SNAPSHOT_META = CACHE_DIR / "thane_landsat.json"
SNAPSHOT_TTL = timedelta(days=1)


@dataclass
class Snapshot:
    """A Thane-sized window of one Landsat scene."""

    lst: np.ndarray  # degrees Celsius, NaN where cloudy or not retrieved
    ndvi: np.ndarray  # -1..1, NaN where cloudy
    transform: Tuple[float, float, float, float, float, float]
    crs: str
    scene_id: str
    platform: str
    acquired: str
    cloud_cover: float
    usable_fraction: float
    fetched_at: str
    # The newest pass over Thane, so the app can explain a scene that is not
    # the latest one available.
    latest_pass: Optional[str] = None
    latest_pass_clear: Optional[float] = None

    def metadata(self) -> Dict[str, Any]:
        return {
            "scene_id": self.scene_id,
            "platform": self.platform,
            "acquired": self.acquired,
            "cloud_cover": round(self.cloud_cover, 1),
            "usable_fraction": round(self.usable_fraction, 3),
            "fetched_at": self.fetched_at,
            "latest_pass": self.latest_pass,
            "latest_pass_clear": (
                None if self.latest_pass_clear is None else round(self.latest_pass_clear, 3)
            ),
            "collection": "Landsat Collection 2 Level-2 (USGS)",
            "bands": "ST_B10 surface temperature, SR_B4/SR_B5 NDVI",
            "resolution_m": 30,
            "provider": "Microsoft Planetary Computer",
        }


_lock = threading.Lock()
_snapshot: Optional[Snapshot] = None
_state: Dict[str, Any] = {"status": "idle", "detail": "", "attempted_at": None}


def _row_col(snapshot: Snapshot, lat: float, lon: float) -> Optional[Tuple[int, int]]:
    from rasterio.transform import Affine, rowcol
    from rasterio.warp import transform as warp_transform

    xs, ys = warp_transform("EPSG:4326", snapshot.crs, [lon], [lat])
    affine = Affine(*snapshot.transform)
    row, col = rowcol(affine, xs[0], ys[0])
    row, col = int(row), int(col)
    height, width = snapshot.lst.shape
    if 0 <= row < height and 0 <= col < width:
        return row, col
    return None


def _window_median(array: np.ndarray, row: int, col: int, radius: int) -> Optional[float]:
    height, width = array.shape
    top, bottom = max(0, row - radius), min(height, row + radius + 1)
    left, right = max(0, col - radius), min(width, col + radius + 1)
    patch = array[top:bottom, left:right]
    if patch.size == 0 or np.all(np.isnan(patch)):
        return None
    return float(np.nanmedian(patch))


def sample(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Reads surface temperature and NDVI for one coordinate from the snapshot."""
    snapshot = get_snapshot()
    if snapshot is None:
        return None

    position = _row_col(snapshot, lat, lon)
    if position is None:
        return None
    row, col = position

    # 3x3 pixels is ~90 m; widen only when cloud has blanked the neighbourhood.
    lst = None
    used_radius = 1
    for radius in (1, 4, 10, 20):
        lst = _window_median(snapshot.lst, row, col, radius)
        if lst is not None:
            used_radius = radius
            break
    if lst is None:
        return None

    ndvi = _window_median(snapshot.ndvi, row, col, max(used_radius, 1))

    return {
        "lst_celsius": round(lst, 2),
        "ndvi_index": None if ndvi is None else round(max(-1.0, min(1.0, ndvi)), 3),
        "sample_radius_m": used_radius * 30,
        "gap_filled": used_radius > 1,
        "scene": snapshot.metadata(),
    }


def city_statistics() -> Optional[Dict[str, float]]:
    # Non-blocking, so the status endpoint always describes the snapshot that
    # status() just reported rather than triggering a fetch of its own.
    snapshot = get_snapshot(block=False)
    if snapshot is None:
        return None
    values = snapshot.lst[~np.isnan(snapshot.lst)]
    if values.size == 0:
        return None
    return {
        "min_celsius": round(float(values.min()), 2),
        "mean_celsius": round(float(values.mean()), 2),
        "max_celsius": round(float(values.max()), 2),
    }


def status() -> Dict[str, Any]:
    snapshot = get_snapshot(block=False)
    if snapshot is not None:
        return {"source": "landsat", "status": "ready", "scene": snapshot.metadata()}
    return {
        "source": "model",
        "status": _state["status"],
        "detail": _state["detail"],
        "scene": None,
    }


def get_snapshot(block: bool = True) -> Optional[Snapshot]:
    global _snapshot
    if _snapshot is not None and not _is_stale(_snapshot):
        return _snapshot
    if not block:
        _load_from_disk()
        return _snapshot
    with _lock:
        if _snapshot is not None and not _is_stale(_snapshot):
            return _snapshot
        _load_from_disk()
        if _snapshot is not None and not _is_stale(_snapshot):
            return _snapshot
        try:
            _state["status"] = "fetching"
            fetched = _fetch_snapshot()
        except Exception as exc:  # network, STAC or raster failure
            logger.warning("Landsat fetch failed: %s", exc)
            _state.update(status="unavailable", detail=str(exc), attempted_at=_now())
            return _snapshot
        if fetched is None:
            _state.update(
                status="no_usable_scene",
                detail="No recent Landsat scene met the coverage and clear-pixel thresholds.",
                attempted_at=_now(),
            )
            return _snapshot
        _snapshot = fetched
        _save_to_disk(fetched)
        _state.update(status="ready", detail="", attempted_at=_now())
        return _snapshot


def prefetch() -> None:
    """Warms the snapshot in the background so the first request is not slow."""
    threading.Thread(target=get_snapshot, name="landsat-prefetch", daemon=True).start()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _is_stale(snapshot: Snapshot) -> bool:
    try:
        fetched = datetime.fromisoformat(snapshot.fetched_at)
    except ValueError:
        return True
    return datetime.now(timezone.utc) - fetched > SNAPSHOT_TTL


def _read_window(href: str, bbox: Tuple[float, float, float, float]):
    import rasterio
    from rasterio.warp import transform_bounds
    from rasterio.windows import from_bounds

    with rasterio.open(href) as src:
        projected = transform_bounds("EPSG:4326", src.crs, *bbox)
        window = from_bounds(*projected, transform=src.transform)
        array = src.read(1, window=window)
        return array, src.window_transform(window), str(src.crs)


def _fetch_snapshot() -> Optional[Snapshot]:
    import planetary_computer as pc
    from pystac_client import Client

    catalog = Client.open(STAC_URL, modifier=pc.sign_inplace)

    for days in (SEARCH_DAYS, FALLBACK_SEARCH_DAYS):
        start = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat()
        end = datetime.now(timezone.utc).date().isoformat()
        search = catalog.search(
            collections=[COLLECTION],
            bbox=list(THANE_BBOX),
            datetime=f"{start}/{end}",
            query={
                "eo:cloud_cover": {"lt": MAX_CLOUD},
                "platform": {"in": ["landsat-8", "landsat-9"]},
            },
        )
        items = sorted(search.item_collection(), key=lambda item: item.datetime, reverse=True)
        logger.info("Landsat search over Thane returned %s candidate scenes", len(items))

        # The QA band is small and cheap, so screen candidates on it first. A
        # nearly cloud-free scene beats a fresher one full of holes, but among
        # equally clear scenes the most recent wins.
        screened = []
        for item in items[:MAX_SCREENED]:
            clear = _screen_item(item)
            if clear is not None and clear >= MIN_USABLE:
                screened.append((clear, item))
        screened.sort(key=lambda pair: (round(pair[0], 1), pair[1].datetime), reverse=True)

        for clear_fraction, item in screened:
            snapshot = _try_item(item)
            if snapshot is not None:
                latest_pass, latest_pass_clear = _latest_pass(catalog)
                snapshot.latest_pass = latest_pass
                snapshot.latest_pass_clear = latest_pass_clear
                logger.info(
                    "Using Landsat scene %s (%s, %.0f%% usable, screened clear %.0f%%)",
                    snapshot.scene_id,
                    snapshot.acquired,
                    snapshot.usable_fraction * 100,
                    clear_fraction * 100,
                )
                return snapshot
    return None


def _screen_item(item) -> Optional[float]:
    """Returns the clear-pixel fraction over Thane, or None if the scene misses it."""
    probed = _probe_item(item)
    if probed is None:
        return None
    coverage, clear = probed
    return clear if coverage >= MIN_COVERAGE else None


def _probe_item(item) -> Optional[Tuple[float, float]]:
    """Reads only the QA band and reports (coverage, clear fraction) over Thane."""
    try:
        qa, _, _ = _read_window(item.assets["qa_pixel"].href, THANE_BBOX)
    except Exception as exc:
        logger.debug("Skipping %s, QA read failed: %s", item.id, exc)
        return None
    if qa.size == 0:
        return None
    coverage = 1.0 - float((qa & 1).astype(bool).mean())
    clear = float(((qa >> 6) & 1).astype(bool).mean())
    return coverage, clear


def _latest_pass(catalog) -> Tuple[Optional[str], Optional[float]]:
    """The newest pass over Thane at any cloud level, so the app can say why a
    fresher scene was not used."""
    try:
        start = (datetime.now(timezone.utc) - timedelta(days=60)).date().isoformat()
        end = datetime.now(timezone.utc).date().isoformat()
        search = catalog.search(
            collections=[COLLECTION],
            bbox=list(THANE_BBOX),
            datetime=f"{start}/{end}",
            query={"platform": {"in": ["landsat-8", "landsat-9"]}},
        )
        items = sorted(search.item_collection(), key=lambda item: item.datetime, reverse=True)
        for item in items[:6]:
            probed = _probe_item(item)
            if probed is None:
                continue
            coverage, clear = probed
            if coverage >= MIN_COVERAGE:
                return item.datetime.date().isoformat(), clear
    except Exception as exc:
        logger.debug("Could not determine the latest Landsat pass: %s", exc)
    return None, None


def _try_item(item) -> Optional[Snapshot]:
    try:
        qa, _, _ = _read_window(item.assets["qa_pixel"].href, THANE_BBOX)
    except Exception as exc:
        logger.debug("Skipping %s, QA read failed: %s", item.id, exc)
        return None

    if qa.size == 0:
        return None
    covered = 1.0 - float((qa & 1).astype(bool).mean())
    if covered < MIN_COVERAGE:
        return None

    clear = ((qa >> 6) & 1).astype(bool)
    if clear.mean() < MIN_USABLE:
        return None

    try:
        thermal, transform, crs = _read_window(item.assets["lwir11"].href, THANE_BBOX)
    except Exception as exc:
        logger.debug("Skipping %s, thermal read failed: %s", item.id, exc)
        return None

    retrieved = thermal > ST_FILL_FLOOR
    usable = clear & retrieved
    usable_fraction = float(usable.mean())
    if usable_fraction < MIN_USABLE:
        return None

    lst = np.where(usable, thermal.astype("float32") * ST_SCALE + ST_OFFSET - 273.15, np.nan)
    # Physical sanity check: an urban daytime scene cannot sit outside this range.
    finite = lst[~np.isnan(lst)]
    if finite.size == 0 or not (0.0 < float(np.nanmean(finite)) < 70.0):
        return None
    lst = np.where((lst > -10.0) & (lst < 80.0), lst, np.nan)

    ndvi = np.full(lst.shape, np.nan, dtype="float32")
    try:
        red, _, _ = _read_window(item.assets["red"].href, THANE_BBOX)
        nir, _, _ = _read_window(item.assets["nir08"].href, THANE_BBOX)
        if red.shape == lst.shape and nir.shape == lst.shape:
            red_ref = red.astype("float32") * SR_SCALE + SR_OFFSET
            nir_ref = nir.astype("float32") * SR_SCALE + SR_OFFSET
            denominator = nir_ref + red_ref
            with np.errstate(invalid="ignore", divide="ignore"):
                raw = (nir_ref - red_ref) / denominator
            valid = clear & (red > 0) & (nir > 0) & (np.abs(denominator) > 1e-6)
            ndvi = np.where(valid, np.clip(raw, -1.0, 1.0), np.nan).astype("float32")
    except Exception as exc:
        logger.debug("NDVI unavailable for %s: %s", item.id, exc)

    return Snapshot(
        lst=lst.astype("float32"),
        ndvi=ndvi,
        transform=tuple(transform)[:6],
        crs=crs,
        scene_id=item.id,
        platform=str(item.properties.get("platform", "landsat")).replace("-", " ").title(),
        acquired=item.datetime.date().isoformat(),
        cloud_cover=float(item.properties.get("eo:cloud_cover", float("nan"))),
        usable_fraction=usable_fraction,
        fetched_at=_now(),
    )


def _save_to_disk(snapshot: Snapshot) -> None:
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        np.savez_compressed(SNAPSHOT_FILE, lst=snapshot.lst, ndvi=snapshot.ndvi)
        meta = {
            "transform": list(snapshot.transform),
            "crs": snapshot.crs,
            "scene_id": snapshot.scene_id,
            "platform": snapshot.platform,
            "acquired": snapshot.acquired,
            "cloud_cover": snapshot.cloud_cover,
            "usable_fraction": snapshot.usable_fraction,
            "fetched_at": snapshot.fetched_at,
            "latest_pass": snapshot.latest_pass,
            "latest_pass_clear": snapshot.latest_pass_clear,
        }
        SNAPSHOT_META.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    except Exception as exc:
        logger.debug("Could not cache Landsat snapshot: %s", exc)


def _load_from_disk() -> None:
    global _snapshot
    if _snapshot is not None:
        return
    if not (SNAPSHOT_FILE.exists() and SNAPSHOT_META.exists()):
        return
    try:
        meta = json.loads(SNAPSHOT_META.read_text(encoding="utf-8"))
        with np.load(SNAPSHOT_FILE) as data:
            candidate = Snapshot(
                lst=data["lst"],
                ndvi=data["ndvi"],
                transform=tuple(meta["transform"]),
                crs=meta["crs"],
                scene_id=meta["scene_id"],
                platform=meta["platform"],
                acquired=meta["acquired"],
                cloud_cover=meta["cloud_cover"],
                usable_fraction=meta["usable_fraction"],
                fetched_at=meta["fetched_at"],
                latest_pass=meta.get("latest_pass"),
                latest_pass_clear=meta.get("latest_pass_clear"),
            )
        if not _is_stale(candidate):
            _snapshot = candidate
            _state.update(status="ready", detail="")
    except Exception as exc:
        logger.debug("Could not load cached Landsat snapshot: %s", exc)


# ---------------------------------------------------------------------------
# Yearly pre-monsoon peaks, used by the historical chart.
# ---------------------------------------------------------------------------

HISTORY_FILE = CACHE_DIR / "thane_landsat_history.json"
HISTORY_TTL = timedelta(days=30)
_history_lock = threading.Lock()


def yearly_peaks(years: int = 6) -> Optional[list]:
    """City-wide surface temperature from the clearest pre-monsoon scene per year."""
    cached = _load_history()
    if cached is not None:
        return cached

    if not _history_lock.acquire(blocking=False):
        return None
    try:
        import planetary_computer as pc
        from pystac_client import Client

        catalog = Client.open(STAC_URL, modifier=pc.sign_inplace)
        this_year = datetime.now(timezone.utc).year
        rows = []
        for year in range(this_year - years + 1, this_year + 1):
            search = catalog.search(
                collections=[COLLECTION],
                bbox=list(THANE_BBOX),
                # March to May is Thane's pre-monsoon peak and its clearest window.
                datetime=f"{year}-03-01/{year}-05-31",
                query={
                    "eo:cloud_cover": {"lt": MAX_CLOUD},
                    "platform": {"in": ["landsat-8", "landsat-9"]},
                },
            )
            items = sorted(
                search.item_collection(),
                key=lambda item: item.properties.get("eo:cloud_cover", 100),
            )
            for item in items[:4]:
                snapshot = _try_item(item)
                if snapshot is None:
                    continue
                values = snapshot.lst[~np.isnan(snapshot.lst)]
                if values.size == 0:
                    continue
                rows.append(
                    {
                        "year": str(year),
                        "scene_date": snapshot.acquired,
                        "mean_celsius": round(float(values.mean()), 1),
                        "max_celsius": round(float(np.percentile(values, 99)), 1),
                        "min_celsius": round(float(np.percentile(values, 1)), 1),
                        "cloud_cover": round(snapshot.cloud_cover, 1),
                    }
                )
                break
        if not rows:
            return None
        _save_history(rows)
        return rows
    except Exception as exc:
        logger.warning("Landsat history unavailable: %s", exc)
        return None
    finally:
        _history_lock.release()


def prefetch_history() -> None:
    threading.Thread(target=yearly_peaks, name="landsat-history", daemon=True).start()


def _save_history(rows: list) -> None:
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        HISTORY_FILE.write_text(
            json.dumps({"built_at": _now(), "rows": rows}, indent=2), encoding="utf-8"
        )
    except Exception as exc:
        logger.debug("Could not cache Landsat history: %s", exc)


def _load_history() -> Optional[list]:
    if not HISTORY_FILE.exists():
        return None
    try:
        payload = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
        built = datetime.fromisoformat(payload["built_at"])
        if datetime.now(timezone.utc) - built > HISTORY_TTL:
            return None
        return payload["rows"]
    except Exception:
        return None


def distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(
        math.radians(lat2)
    ) * math.sin(dlon / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))
