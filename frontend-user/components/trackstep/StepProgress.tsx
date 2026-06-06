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
    <section className="w-full overflow-x-auto rounded-[14px] border border-[#7FA7E8] bg-white px-4 py-6 shadow-sm sm:px-8">
      <div className="flex min-w-[520px] items-start gap-0">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const rejected = rejectedStep === stepNumber;
          const isLast = stepNumber === steps.length;
          const done = !rejected && (isCompleted || stepNumber < activeStep);
          const current = !rejected && stepNumber === activeStep && !isCompleted;
          const circleClass = rejected
            ? "border-[#B8564F] bg-[#B8564F] text-white"
            : current
              ? "border-[#60A5FA] bg-[#DBEAFE] text-[#2563EB]"
              : done
                ? "border-[#366DBD] bg-[#366DBD] text-white"
                : "border-gray-300 bg-white text-gray-300";
          const leftLineActive = index !== 0 && (done || current || rejected);
          const rightLineActive = !isLast && done && !current && !rejected;

          return (
            <div
              key={step.label}
              className="flex flex-1 flex-col items-center text-center"
            >
              <div className="flex w-full items-center">
                <div
                  className={`h-1 flex-1 ${
                    index === 0
                      ? "invisible"
                      : leftLineActive
                        ? "bg-[#366DBD]"
                        : "bg-gray-200"
                  }`}
                />
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-bold transition-all ${circleClass}`}
                >
                  {rejected ? (
                    <X size={15} strokeWidth={3} />
                  ) : done ? (
                    <Check size={15} strokeWidth={3} />
                  ) : (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        current ? "bg-[#60A5FA]" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
                <div
                  className={`h-1 flex-1 ${
                    isLast
                      ? "invisible"
                      : rightLineActive
                        ? "bg-[#366DBD]"
                        : "bg-gray-200"
                  }`}
                />
              </div>

              <p
                className={`mt-2 text-[11px] font-semibold leading-tight sm:text-[13px] ${
                  rejected
                    ? "text-[#B8564F]"
                    : current
                      ? "text-[#2563EB]"
                      : done
                        ? "text-[#366DBD]"
                        : "text-gray-400"
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
