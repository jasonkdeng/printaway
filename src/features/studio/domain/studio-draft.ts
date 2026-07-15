import { quoteConsentSchema, quoteContactSchema } from "./quote-request";
import { referenceUploadMetadataSchema } from "./reference-upload";
import { studioSteps, type StudioStep } from "./studio-steps";

export const studioFoundationOptions = {
  materials: ["PLA", "ABS"],
  finishes: ["Default", "Glossy"],
} as const;

export type StudioMaterial = (typeof studioFoundationOptions.materials)[number];
export type StudioFinish = (typeof studioFoundationOptions.finishes)[number];

export type StudioReference = {
  id: string;
  fileName: string;
  byteLength: number;
};

export type StudioContactDraft = {
  name: string;
  email: string;
  phone: string;
  company: string;
};

export type StudioDraft = {
  currentStepIndex: number;
  completedStepIndexes: number[];
  description: string;
  references: StudioReference[];
  material: StudioMaterial | null;
  dimensions: {
    lengthMm: string;
    widthMm: string;
    heightMm: string;
  };
  finish: StudioFinish | null;
  quantity: string;
  contact: StudioContactDraft;
  privacyConsent: boolean;
  issues: StudioValidationIssue[];
  statusMessage: string;
};

export type StudioValidationIssue = {
  code:
    | "reference_required"
    | "unsupported_file_type"
    | "file_too_large"
    | "material_required"
    | "dimension_required"
    | "dimension_positive"
    | "finish_required"
    | "quantity_required"
    | "quantity_positive"
    | "quantity_whole"
    | "name_required"
    | "email_required"
    | "email_invalid"
    | "privacy_consent_required";
  field: string;
  message: string;
};

type DimensionField = keyof StudioDraft["dimensions"];
type ContactField = keyof StudioContactDraft;

export type StudioAction =
  | { type: "set_description"; value: string }
  | { type: "set_references"; value: StudioReference[] }
  | { type: "remove_reference"; id: string }
  | { type: "set_material"; value: StudioMaterial | null }
  | { type: "set_dimension"; field: DimensionField; value: string }
  | { type: "set_finish"; value: StudioFinish | null }
  | { type: "set_quantity"; value: string }
  | { type: "set_contact"; field: ContactField; value: string }
  | { type: "set_privacy_consent"; value: boolean }
  | { type: "set_step"; stepIndex: number }
  | { type: "complete_step"; stepIndex: number }
  | { type: "set_issues"; issues: StudioValidationIssue[] }
  | { type: "set_status"; message: string };

export function createInitialStudioDraft(): StudioDraft {
  return {
    currentStepIndex: 0,
    completedStepIndexes: [],
    description: "",
    references: [],
    material: null,
    dimensions: { lengthMm: "", widthMm: "", heightMm: "" },
    finish: null,
    quantity: "",
    contact: { name: "", email: "", phone: "", company: "" },
    privacyConsent: false,
    issues: [],
    statusMessage: "",
  };
}

export function studioReducer(state: StudioDraft, action: StudioAction): StudioDraft {
  switch (action.type) {
    case "set_description":
      return { ...state, description: action.value };
    case "set_references":
      return { ...state, references: action.value };
    case "remove_reference":
      return { ...state, references: state.references.filter((reference) => reference.id !== action.id) };
    case "set_material":
      return { ...state, material: action.value };
    case "set_dimension":
      return { ...state, dimensions: { ...state.dimensions, [action.field]: action.value } };
    case "set_finish":
      return { ...state, finish: action.value };
    case "set_quantity":
      return { ...state, quantity: action.value };
    case "set_contact":
      return { ...state, contact: { ...state.contact, [action.field]: action.value } };
    case "set_privacy_consent":
      return { ...state, privacyConsent: action.value };
    case "set_step":
      return { ...state, currentStepIndex: Math.min(Math.max(action.stepIndex, 0), studioSteps.length - 1), issues: [], statusMessage: "" };
    case "complete_step":
      return state.completedStepIndexes.includes(action.stepIndex)
        ? state
        : { ...state, completedStepIndexes: [...state.completedStepIndexes, action.stepIndex].sort((a, b) => a - b) };
    case "set_issues":
      return { ...state, issues: action.issues };
    case "set_status":
      return { ...state, statusMessage: action.message };
  }
}

function validateReference(draft: StudioDraft): StudioValidationIssue[] {
  if (!draft.description.trim() && draft.references.length === 0) {
    return [{ code: "reference_required", field: "description", message: "Describe the object or choose a supported reference file." }];
  }

  for (const reference of draft.references) {
    const result = referenceUploadMetadataSchema.safeParse(reference);
    if (!result.success) {
      const code = result.error.issues[0]?.message === "file_too_large" ? "file_too_large" : "unsupported_file_type";
      return [{
        code,
        field: "references",
        message: code === "file_too_large" ? "Choose a file no larger than 10 MB." : "Choose a supported reference file type.",
      }];
    }
  }

  return [];
}

function validateDimensions(draft: StudioDraft): StudioValidationIssue[] {
  const labels: Record<DimensionField, string> = {
    lengthMm: "length",
    widthMm: "width",
    heightMm: "height",
  };
  const issues: StudioValidationIssue[] = [];

  for (const field of Object.keys(draft.dimensions) as DimensionField[]) {
    const value = draft.dimensions[field].trim();
    if (!value) {
      issues.push({ code: "dimension_required", field, message: `Enter a ${labels[field]} in millimetres.` });
      continue;
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      issues.push({ code: "dimension_positive", field, message: `Enter a ${labels[field]} greater than 0 mm.` });
    }
  }

  return issues;
}

function validateReview(draft: StudioDraft): StudioValidationIssue[] {
  const issues: StudioValidationIssue[] = [];
  const contact = quoteContactSchema.safeParse(draft.contact);
  if (!contact.success) {
    const paths = new Set(contact.error.issues.map((issue) => issue.path[0]));
    if (paths.has("name")) {
      issues.push({ code: "name_required", field: "name", message: "Enter your name." });
    }
    if (paths.has("email")) {
      issues.push({
        code: draft.contact.email.trim() ? "email_invalid" : "email_required",
        field: "email",
        message: draft.contact.email.trim() ? "Enter a valid email address." : "Enter your email address.",
      });
    }
  }
  if (!quoteConsentSchema.safeParse({ privacyConsent: draft.privacyConsent }).success) {
    issues.push({ code: "privacy_consent_required", field: "privacyConsent", message: "Consent is required before a quote request can be submitted." });
  }
  return issues;
}

export function validateStudioStep(draft: StudioDraft, step: StudioStep): StudioValidationIssue[] {
  switch (step) {
    case "Reference":
      return validateReference(draft);
    case "Material":
      return draft.material ? [] : [{ code: "material_required", field: "material", message: "Choose a material preference." }];
    case "Size":
      return validateDimensions(draft);
    case "Finish":
      return draft.finish ? [] : [{ code: "finish_required", field: "finish", message: "Choose a finish preference." }];
    case "Quantity": {
      const value = draft.quantity.trim();
      if (!value) {
        return [{ code: "quantity_required", field: "quantity", message: "Enter a quantity." }];
      }
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return [{ code: "quantity_positive", field: "quantity", message: "Enter a quantity greater than 0." }];
      }
      return Number.isInteger(numericValue)
        ? []
        : [{ code: "quantity_whole", field: "quantity", message: "Enter a whole-number quantity." }];
    }
    case "Review and submit":
      return validateReview(draft);
  }
}
