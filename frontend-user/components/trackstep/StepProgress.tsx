"use client";

import { StepProgressProps } from "@/types/tracking";

import { Check } from "lucide-react";

export default function StepProgress({
  steps,
  activeStep,
  isCompleted = false,
}: StepProgressProps) {
  return (
    <section className="w-full rounded-[36px] bg-gray-200 px-4 py-10 shadow-xl sm:px-10 md:px-16 lg:px-20">
      <div className="relative flex items-start justify-between">
        {/* BG LINE */}
        <div className="absolute left-[12.5%] right-[12.5%] top-[16px] h-[6px] -translate-y-1/2 rounded-full bg-[#D7E6FF] sm:top-[19px]" />

        {/* ACTIVE LINE */}
        <div
          className="absolute left-[12.5%] top-[16px] h-[6px] -translate-y-1/2 rounded-full bg-[#2F66C5] transition-all sm:top-[19px]"
          style={{
            width: `${
              ((activeStep - 1) / (steps.length - 1)) * 75
            }%`,
          }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;

          const done =
            stepNumber < activeStep ||
            isCompleted;

          const current =
            stepNumber === activeStep &&
            !isCompleted;

          return (
            <div
              key={step.label}
              className="relative z-10 flex flex-1 flex-col items-center text-center"
            >
              {/* CIRCLE */}
              <div
                className={`flex h-[32px] w-[32px] items-center justify-center rounded-full sm:h-[38px] sm:w-[38px] ${
                  done || current
                    ? "bg-[#2F66C5]"
                    : "bg-[#D7E6FF]"
                }`}
              >
                {done && (
                  <Check
                    size={20}
                    className="text-white sm:size-6"
                  />
                )}
              </div>

              {/* TITLE */}
              <p
                className={`mt-3 text-[11px] font-medium leading-tight sm:mt-4 sm:text-[15px] ${
                  done || current
                    ? "text-black"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </p>

              {/* DATE */}
              <p className="mt-1 text-[10px] text-gray-500 sm:text-[11px]">
                {step.date ?? "-"}
              </p>

              {/* TIME */}
              <p className="mt-[2px] text-[10px] text-gray-400 sm:text-[11px]">
                {step.time ?? "รอดำเนินการ"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}