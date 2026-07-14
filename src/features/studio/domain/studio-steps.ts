export const studioSteps = [
  "Reference",
  "Material",
  "Size",
  "Finish",
  "Quantity",
  "Review and submit",
] as const;

export type StudioStep = (typeof studioSteps)[number];
