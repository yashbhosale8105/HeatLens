import { Neighborhood } from '@/lib/types';

export function PlaceChips({
  label,
  places,
  onPick,
  activeName,
}: {
  label: string;
  places: Neighborhood[];
  onPick: (place: Neighborhood) => void;
  activeName?: string;
}) {
  if (!places.length) return null;

  return (
    <div className="chip-row">
      <p className="chip-label">{label}</p>
      <div className="chip-wrap">
        {places.map((place) => (
          <button
            key={place.name}
            type="button"
            className={`chip-btn${activeName === place.name ? ' is-active' : ''}`}
            onClick={() => onPick(place)}
          >
            {place.name}
          </button>
        ))}
      </div>
    </div>
  );
}
