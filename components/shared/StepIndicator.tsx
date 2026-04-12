"use client";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number; // 0-indexed
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const isLast = i === steps.length - 1;

          return (
            <li key={i} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                    done
                      ? "bg-esdm-gold border-esdm-gold text-white"
                      : active
                      ? "bg-white border-esdm-gold text-esdm-gold"
                      : "bg-white border-slate-300 text-slate-400",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? (
                    <CheckIcon />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span
                  className={[
                    "text-xs font-medium whitespace-nowrap",
                    active ? "text-esdm-gold" : done ? "text-slate-600" : "text-slate-400",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={[
                    "flex-1 h-0.5 mx-3 mb-5 transition-colors",
                    done ? "bg-esdm-gold" : "bg-slate-200",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
