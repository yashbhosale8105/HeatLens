'use client';

import { useApp } from '@/app/providers';

/** States plainly where the surface temperatures came from. */
export function SourceNote({ className = '' }: { className?: string }) {
  const { source } = useApp();
  if (!source) return null;

  if (source.source === 'landsat' && source.scene) {
    const scene = source.scene;
    const newerPass =
      scene.latest_pass && scene.latest_pass !== scene.acquired ? scene.latest_pass : null;
    return (
      <div className={`space-y-1 ${className}`}>
        <p className="text-sm text-[var(--muted)]">
          Ground temperatures measured by {scene.platform} on{' '}
          <strong className="font-medium text-[var(--ink)]">{scene.acquired}</strong> at{' '}
          {scene.resolution_m} m per pixel · {Math.round(scene.usable_fraction * 100)}% of Thane
          clear · {scene.collection} via {scene.provider}
        </p>
        {newerPass && (
          <p className="text-sm text-[var(--muted)]">
            A satellite passed over Thane more recently, on {newerPass}, but
            {scene.latest_pass_clear !== null
              ? ` only ${Math.round(scene.latest_pass_clear * 100)}% of the city was cloud-free`
              : ' cloud blocked the view'}
            , so this clearer scene is used instead.
          </p>
        )}
      </div>
    );
  }

  const waiting = source.status === 'fetching' || source.status === 'idle';
  return (
    <div className={`panel border-[var(--heat)] px-4 py-3 ${className}`} role="status">
      <p className="text-sm font-medium text-[var(--heat)]">
        {waiting ? 'Downloading the latest Landsat scene…' : 'Showing modelled estimates, not measurements'}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {waiting
          ? 'Ground temperatures below are modelled placeholders until the satellite scene finishes loading.'
          : source.model_note || source.detail}
      </p>
    </div>
  );
}
