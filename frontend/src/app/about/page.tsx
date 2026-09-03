import { PageHeader } from '@/components/PageHeader';

export default function AboutPage() {
  return (
    <div className="page max-w-3xl space-y-6">
      <PageHeader kicker="Guide" title="How HeatLens works">
        A simple place to see air heat, ground heat, and which parts of Thane run warmer.
      </PageHeader>

      <section className="panel space-y-3 px-6 py-6">
        <h2 className="text-[1.65rem]">What you can do</h2>
        <ul className="list-disc space-y-2 pl-5 leading-relaxed">
          <li>Read today’s air temperature, humidity, and how it feels on every page.</li>
          <li>Open the map, type a neighbourhood, and click a point for a ground reading.</li>
          <li>Search or sort the table, then download CSV or GeoJSON.</li>
        </ul>
      </section>

      <section className="panel space-y-3 px-6 py-6">
        <h2 className="text-[1.65rem]">Where the numbers come from</h2>
        <p className="leading-relaxed">
          Air temperature, humidity, wind and UV are live readings from Open-Meteo. The heat index
          follows the NOAA method: it is how hot the air feels, not the temperature of the ground.
        </p>
        <p className="leading-relaxed">
          Ground temperature is measured, not estimated. HeatLens reads the most recent usable
          Landsat 8 or 9 scene over Thane from the USGS Collection 2 Level-2 archive, using the
          ST_B10 thermal band at 30 m per pixel, and computes greenery (NDVI) from the red and
          near-infrared bands of the same scene. Cloudy pixels are masked out with the scene quality
          band, and the app names the satellite, the date and the cloud cover behind every reading.
        </p>
        <p className="leading-relaxed">
          Two things follow from using real satellite data. Ground temperature is the temperature of
          the surface itself, so on a clear afternoon tarmac can read 20°C above the air temperature.
          And scenes only pass over every eight days or so, and Thane’s monsoon months are heavily
          clouded, so the newest usable scene may be several weeks old. The date shown is always the
          date the measurement was taken.
        </p>
        <p className="leading-relaxed">
          If no usable scene can be reached, HeatLens says so on the page and labels the numbers as
          modelled estimates rather than passing them off as measurements.
        </p>
      </section>

      <section className="panel space-y-4 px-6 py-6">
        <h2 className="text-[1.65rem]">Heat index bands</h2>
        <dl className="space-y-3">
          <Band name="Normal" tone="badge-ok" text="Comfortable for most people outdoors." />
          <Band name="Caution" tone="badge-warm" text="Fatigue possible with long activity." />
          <Band name="Extreme Caution" tone="badge-warm" text="Heat cramps or exhaustion more likely." />
          <Band name="Danger" tone="badge-hot" text="Heat exhaustion likely. Limit outdoor work." />
          <Band name="Extreme Danger" tone="badge-hot" text="Heat stroke risk. Stay indoors if you can." />
        </dl>
      </section>
    </div>
  );
}

function Band({ name, tone, text }: { name: string; tone: string; text: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
      <dt className="sm:w-44">
        <span className={`badge ${tone}`}>{name}</span>
      </dt>
      <dd className="text-[var(--muted)]">{text}</dd>
    </div>
  );
}
