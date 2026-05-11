export type TrackingStep = {
  label: string;
  date?: string;
  time?: string;
};

export type StepProgressProps = {
  steps: TrackingStep[];
  activeStep: number;
  isCompleted?: boolean;
};
