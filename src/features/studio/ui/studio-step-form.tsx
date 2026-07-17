import type { Dispatch } from "react";

import {
  privacyConsentCopy,
  privacyPolicyPath,
} from "@/features/studio/domain/quote-request";
import {
  studioFoundationOptions,
  type StudioAction,
  type StudioDraft,
  type StudioFinish,
  type StudioMaterial,
  type StudioValidationIssue,
} from "@/features/studio/domain/studio-draft";
import type { StudioStep } from "@/features/studio/domain/studio-steps";
import type { StudioCapabilities } from "@/features/studio/domain/studio-configuration";

import styles from "./studio-configurator.module.css";

type StudioStepFormProps = {
  draft: StudioDraft;
  dispatch: Dispatch<StudioAction>;
  step: StudioStep;
  onFilesSelected: (files: FileList | null) => void;
  onRemoveReference: (id: string) => void;
  capabilities: StudioCapabilities | null;
};

const stepContent = {
  Reference: {
    heading: "Add a reference",
    description: "Describe the object or select a model, drawing, or reference image. One reference method is required.",
  },
  Material: {
    heading: "Choose a material",
    description: "Record a material preference. Suitability and compatibility will be confirmed during manual review.",
  },
  Size: {
    heading: "Enter the size",
    description: "Use millimetres. Machine limits and manufacturability will be checked during manual review.",
  },
  Finish: {
    heading: "Choose a finish",
    description: "Record the observable finish you want. Availability and production impact will be confirmed later.",
  },
  Quantity: {
    heading: "Set the quantity",
    description: "Enter a positive whole number. Larger quantities remain valid quote requests and require manual review.",
  },
  "Review and submit": {
    heading: "Review the request",
    description: "Check the configuration and add the approved contact details. Nothing on this page is submitted or uploaded.",
  },
} as const;

function issueFor(issues: StudioValidationIssue[], field: string) {
  return issues.find((issue) => issue.field === field);
}

function FieldError({ issue }: { issue: StudioValidationIssue | undefined }) {
  return issue ? <p className={styles.fieldError} id={`${issue.field}-error`}>{issue.message}</p> : null;
}

export function StudioStepForm({ draft, dispatch, step, onFilesSelected, onRemoveReference, capabilities }: StudioStepFormProps) {
  const content = stepContent[step];
  const configuredMaterial = capabilities?.materials.find((material) => material.name === draft.material);
  const materials = capabilities?.materials.map((material) => material.name) ?? studioFoundationOptions.materials;
  const finishes = configuredMaterial?.finishes ?? studioFoundationOptions.finishes;

  return (
    <div className={styles.stepBody}>
      <h2>{content.heading}</h2>
      <p className={styles.stepDescription}>{content.description}</p>

      {step === "Reference" ? (
        <div className={styles.fieldStack}>
          <label className={styles.field} htmlFor="description">
            <span>Project description</span>
            <textarea
              aria-describedby={issueFor(draft.issues, "description") ? "description-error" : undefined}
              id="description"
              onChange={(event) => dispatch({ type: "set_description", value: event.target.value })}
              rows={5}
              value={draft.description}
            />
          </label>
          <FieldError issue={issueFor(draft.issues, "description")} />
          <label className={styles.fileField} htmlFor="references">
            <span>Choose reference files</span>
            <input id="references" multiple onChange={(event) => onFilesSelected(event.target.files)} type="file" />
          </label>
          <p className={styles.helper}>Accepted: STL, PNG, 3MF, SLDPRT, STEP, and SLDASM. Maximum 10 MB per file.</p>
          <FieldError issue={issueFor(draft.issues, "references")} />
          {draft.references.length ? (
            <ul className={styles.referenceList}>
              {draft.references.map((reference) => (
                <li key={reference.id}>
                  <span>{reference.fileName}</span>
                  <button onClick={() => { onRemoveReference(reference.id); dispatch({ type: "remove_reference", id: reference.id }); }} type="button">Remove</button>
                </li>
              ))}
            </ul>
          ) : null}
          <p className={styles.localNotice}>Selected locally. Files are not uploaded or stored.</p>
        </div>
      ) : null}

      {step === "Material" ? (
        <div className={styles.fieldStack}>
          <label className={styles.field} htmlFor="material">
            <span>Material preference</span>
            <span className={styles.selectWrap}>
              <select
                aria-describedby={issueFor(draft.issues, "material") ? "material-error" : undefined}
                id="material"
                onChange={(event) => dispatch({ type: "set_material", value: (event.target.value || null) as StudioMaterial | null })}
                value={draft.material ?? ""}
              >
                <option value="">Choose material</option>
                {materials.map((material) => <option key={material}>{material}</option>)}
              </select>
            </span>
          </label>
          {configuredMaterial ? <p className={styles.helper}>{configuredMaterial.description} {configuredMaterial.properties} {configuredMaterial.uses} {configuredMaterial.limitations} Colours: {configuredMaterial.colours.join(", ")}.</p> : null}
          <FieldError issue={issueFor(draft.issues, "material")} />
        </div>
      ) : null}

      {step === "Size" ? (
        <div className={styles.dimensionGrid}>
          {(["lengthMm", "widthMm", "heightMm"] as const).map((field) => {
            const label = field === "lengthMm" ? "Length (mm)" : field === "widthMm" ? "Width (mm)" : "Height (mm)";
            const issue = issueFor(draft.issues, field);
            return (
              <div key={field}>
                <label className={styles.field} htmlFor={field}>
                  <span>{label}</span>
                  <input
                    aria-describedby={issue ? `${field}-error` : undefined}
                    id={field}
                    inputMode="decimal"
                    min="0.01"
                    onChange={(event) => dispatch({ type: "set_dimension", field, value: event.target.value })}
                    step="any"
                    type="number"
                    value={draft.dimensions[field]}
                  />
                </label>
                <FieldError issue={issue} />
              </div>
            );
          })}
        </div>
      ) : null}

      {step === "Finish" ? (
        <div className={styles.fieldStack}>
          <label className={styles.field} htmlFor="finish">
            <span>Finish preference</span>
            <span className={styles.selectWrap}>
              <select
                aria-describedby={issueFor(draft.issues, "finish") ? "finish-error" : undefined}
                id="finish"
                onChange={(event) => dispatch({ type: "set_finish", value: (event.target.value || null) as StudioFinish | null })}
                value={draft.finish ?? ""}
              >
                <option value="">Choose finish</option>
                {finishes.map((finish) => <option key={finish}>{finish}</option>)}
              </select>
            </span>
          </label>
          <FieldError issue={issueFor(draft.issues, "finish")} />
        </div>
      ) : null}

      {step === "Quantity" ? (
        <div className={styles.fieldStack}>
          <label className={styles.field} htmlFor="quantity">
            <span>Quantity</span>
            <input
              aria-describedby={issueFor(draft.issues, "quantity") ? "quantity-error" : undefined}
              id="quantity"
              inputMode="numeric"
              min="1"
              onChange={(event) => dispatch({ type: "set_quantity", value: event.target.value })}
              step="1"
              type="number"
              value={draft.quantity}
            />
          </label>
          <FieldError issue={issueFor(draft.issues, "quantity")} />
        </div>
      ) : null}

      {step === "Review and submit" ? (
        <div className={styles.review}>
          <dl className={styles.reviewSummary}>
            <div><dt>Reference</dt><dd>{draft.description || draft.references.map((reference) => reference.fileName).join(", ")}</dd></div>
            <div><dt>Material</dt><dd>{draft.material ?? "—"}</dd></div>
            <div><dt>Size</dt><dd>{draft.dimensions.lengthMm} × {draft.dimensions.widthMm} × {draft.dimensions.heightMm} mm</dd></div>
            <div><dt>Finish</dt><dd>{draft.finish ?? "—"}</dd></div>
            <div><dt>Quantity</dt><dd>{draft.quantity}</dd></div>
          </dl>
          <div className={styles.contactGrid}>
            {(["name", "email", "phone", "company"] as const).map((field) => {
              const label = field.charAt(0).toUpperCase() + field.slice(1);
              const issue = issueFor(draft.issues, field);
              return (
                <div key={field}>
                  <label className={styles.field} htmlFor={field}>
                    <span>{label}{field === "phone" || field === "company" ? " (optional)" : ""}</span>
                    <input
                      aria-describedby={issue ? `${field}-error` : undefined}
                      autoComplete={field === "name" ? "name" : field === "email" ? "email" : field === "phone" ? "tel" : "organization"}
                      id={field}
                      onChange={(event) => dispatch({ type: "set_contact", field, value: event.target.value })}
                      type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                      value={draft.contact[field]}
                    />
                  </label>
                  <FieldError issue={issue} />
                </div>
              );
            })}
          </div>
          <div>
            <label className={styles.consent} htmlFor="privacyConsent">
              <input
                aria-describedby={issueFor(draft.issues, "privacyConsent") ? "privacyConsent-error" : undefined}
                checked={draft.privacyConsent}
                id="privacyConsent"
                onChange={(event) => dispatch({ type: "set_privacy_consent", value: event.target.checked })}
                type="checkbox"
              />
              <span>{privacyConsentCopy}</span>
            </label>
            <FieldError issue={issueFor(draft.issues, "privacyConsent")} />
            <a className={styles.policyLink} href={privacyPolicyPath}>Read the Privacy Policy</a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
