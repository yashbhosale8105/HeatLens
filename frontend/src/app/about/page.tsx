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
          Air temperature and humidity come from Open-Meteo. The heat index follows the NOAA method:
          it is how hot the air feels, not the temperature of the ground.
        </p>
        <p className="leading-relaxed">
          Ground readings are estimated on a regular grid over Thane. Greener cells (higher NDVI)
          usually stay cooler than roads and industrial land.
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
