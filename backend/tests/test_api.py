from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_get_current_weather():
    response = client.get("/api/v1/weather/current?lat=19.2183&lon=72.9781")
    assert response.status_code == 200
    data = response.json()
    assert "ambient_temp_celsius" in data
    assert "heat_index_celsius" in data
    assert "risk_category" in data


def test_point_reading():
    response = client.get("/api/v1/thermal/point?lat=19.2183&lon=72.9781")
    assert response.status_code == 200
    data = response.json()
    assert data["data_source"] in {"landsat", "model"}
    assert 0 < data["lst_celsius"] < 80
    assert "vegetation_density" in data
    # A reading may only claim a satellite when it really came from one.
    if data["data_source"] == "landsat":
        assert data["satellite"] and data["acquisition_date"] and data["scene_id"]
    else:
        assert data["satellite"] is None
        assert data["acquisition_date"] is None
        assert data["note"]


def test_grid_readings():
    response = client.get("/api/v1/thermal/grid?count=25")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 25
    assert data[0]["heat_rank"] == 1
    assert data[0]["lst_celsius"] >= data[-1]["lst_celsius"]


def test_source_status():
    response = client.get("/api/v1/thermal/source")
    assert response.status_code == 200
    data = response.json()
    assert data["source"] in {"landsat", "model"}
    if data["source"] == "landsat":
        assert data["scene"]["resolution_m"] == 30
        assert data["model_note"] is None
    else:
        assert data["model_note"]


def test_export_geojson():
    response = client.get("/api/v1/thermal/export?format=geojson&count=16")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 16


def test_export_csv():
    response = client.get("/api/v1/thermal/export?format=csv&count=16")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "rank,id,neighborhood" in response.text


def test_historical_trends():
    response = client.get("/api/v1/thermal/historical")
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "landsat"
    assert isinstance(data["rows"], list)
    if data["available"]:
        assert data["rows"]
        assert {"year", "scene_date", "mean_celsius"} <= set(data["rows"][0])


def test_vegetation_labels_follow_ndvi():
    from app.services.thermal_service import describe_vegetation

    assert describe_vegetation(None) == "Not available"
    assert describe_vegetation(-0.2) == "Water or wet surface"
    assert describe_vegetation(0.05) == "Built-up, little vegetation"
    assert describe_vegetation(0.62) == "Dense vegetation"
