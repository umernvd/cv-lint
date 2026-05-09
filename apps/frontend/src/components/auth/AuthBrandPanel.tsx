import { brandPanel } from './auth-content';
import { BrandLogo } from './primitives/BrandLogo';

export function AuthBrandPanel(): React.JSX.Element {
  return (
    <div className="relative hidden w-[45%] overflow-hidden bg-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="relative z-10">
        <BrandLogo size={48} />
      </div>

      <div className="relative z-10 max-w-sm space-y-6">
        <div className="space-y-3">
          <h2 className="text-display font-heading text-foreground">{brandPanel.heading}</h2>
          <p className="text-body text-muted-foreground">{brandPanel.description}</p>
        </div>

        <ul className="space-y-3">
          {brandPanel.features.map((feature) => (
            <li key={feature.text} className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {feature.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 text-xs text-muted-foreground/60">
        &copy; {new Date().getFullYear()} CV Lint. All rights reserved.
      </div>
    </div>
  );
}
