"use client";

import { StepProgressProps } from "@/types/tracking";

import { Check } from "lucide-react";

export default function StepProgress({
  steps,
  activeStep,
  isCompleted = false,
}: StepProgressProps) {
  return (
    <section className="w-full rounded-[36px] bg-[#F3F3F3] px-20 py-16 shadow-md">
      <div className="relative flex items-start justify-between">
        {/* BG LINE */}
        <div className="absolute left-[70px] right-[70px] top-[24px] h-[6px] rounded-full bg-[#D7E6FF]" />

        {/* ACTIVE LINE */}
        <div
          className="absolute left-[70px] top-[24px] h-[6px] rounded-full bg-[#2F66C5] transition-all"
          style={{
            width: `calc((100% - 140px) * ${
              (activeStep - 1) /
              (steps.length - 1)
            })`,
          }}
        />

        {steps.map((step, index) => {
          const stepNumber =
            index + 1;

          const done =
            stepNumber <
              activeStep ||
            isCompleted;

          const current =
            stepNumber ===
              activeStep &&
            !isCompleted;

          return (
            <div
              key={step.label}
              className="relative z-10 flex w-1/4 flex-col items-center text-center"
            >
              {/* CIRCLE */}
              <div
                className={`flex h-[48px] w-[48px] items-center justify-center rounded-full ${
                  done || current
                    ? "bg-[#2F66C5]"
                    : "bg-[#D7E6FF]"
                }`}
              >
                {done && (
                  <Check
                    size={24}
                    className="text-white"
                  />
                )}
              </div>

              {/* TITLE */}
              <p
                className={`mt-4 text-[15px] font-medium ${
                  done || current
                    ? "text-black"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </p>

              {/* DATE */}
              <p className="mt-1 text-[11px] text-gray-500">
                {step.date ??
                  "-"}
              </p>

              {/* TIME */}
              <p className="mt-[2px] text-[11px] text-gray-400">
                {step.time ??
                  "รอดำเนินการ"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}