"use client";

import { Check, X } from "lucide-react";

import { StepProgressProps } from "@/types/tracking";

type Props = StepProgressProps & {
  rejectedStep?: number;
};

export default function StepProgress({
  steps,
  activeStep,
  isCompleted = false,
  rejectedStep,
}: Props) {
  return (
    <section className="w-full rounded-[36px] bg-gray-200 px-4 py-10 shadow-xl sm:px-10 md:px-16 lg:px-20">
      <div className="relative flex items-start justify-between">
        <div className="absolute left-[12.5%] right-[12.5%] top-[16px] h-[6px] -translate-y-1/2 rounded-full bg-[#D7E6FF] sm:top-[19px]" />

        <div
          className="absolute left-[12.5%] top-[16px] h-[6px] -translate-y-1/2 rounded-full bg-[#2F66C5] transition-all sm:top-[19px]"
          style={{
            width: `${((activeStep - 1) / (steps.length - 1)) * 75}%`,
          }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const rejected = rejectedStep === stepNumber;
          const done = !rejected && (stepNumber < activeStep || isCompleted);
          const current = !rejected && stepNumber === activeStep && !isCompleted;

          return (
            <div
              key={step.label}
              className="relative z-10 flex flex-1 flex-col items-center text-center"
            >
              <div
                className={`flex h-[32px] w-[32px] items-center justify-center rounded-full transition-colors sm:h-[38px] sm:w-[38px] ${
                  rejected
                    ? "bg-[#B8564F]"
                    : done || current
                      ? "bg-[#2F66C5]"
                      : "bg-[#D7E6FF]"
                }`}
              >
                {rejected ? (
                  <X size={20} className="text-white sm:size-6" />
                ) : done ? (
                  <Check size={20} className="text-white sm:size-6" />
                ) : null}
              </div>

              <p
                className={`mt-3 text-[11px] font-medium leading-tight sm:mt-4 sm:text-[15px] ${
                  rejected || done || current ? "text-black" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>

              <p className="mt-1 text-[10px] text-gray-500 sm:text-[11px]">
                {step.date ?? "-"}
              </p>

              <p className="mt-[2px] text-[10px] text-gray-400 sm:text-[11px]">
                {rejected ? "ปฏิเสธ" : step.time ?? "รอดำเนินการ"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
