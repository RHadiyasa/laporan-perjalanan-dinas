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
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                    done
                      ? "bg-gradient-to-br from-teal-500 to-blue-600 border-transparent text-white shadow-sm shadow-teal-200"
                      : active
                      ? "bg-white border-teal-500 text-teal-600"
                      : "bg-white border-slate-200 text-slate-300",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <CheckIcon /> : <span>{i + 1}</span>}
                </div>
                <span
                  className={[
                    "text-xs font-semibold whitespace-nowrap",
                    active
                      ? "text-teal-600"
                      : done
                      ? "text-slate-500"
                      : "text-slate-300",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={[
                    "flex-1 h-0.5 mx-3 mb-5 rounded-full transition-all",
                    done
                      ? "bg-gradient-to-r from-teal-400 to-blue-500"
                      : "bg-slate-100",
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
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
