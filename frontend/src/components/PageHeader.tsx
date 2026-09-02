import type { ReactNode } from 'react';

export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-header">
      <p className="kicker">{kicker}</p>
      <h1 className="display">{title}</h1>
      {children && <p className="lede">{children}</p>}
    </div>
  );
}
