"use client";

import { useEffect, useReducer, useRef } from "react";

import { referenceUploadMetadataSchema } from "@/features/studio/domain/reference-upload";
import {
  createInitialStudioDraft,
  studioReducer,
  validateStudioStep,
  type StudioValidationIssue,
} from "@/features/studio/domain/studio-draft";
import { studioSteps } from "@/features/studio/domain/studio-steps";

import styles from "./studio-configurator.module.css";
import { StudioReadout } from "./studio-readout";
import { StudioStepForm } from "./studio-step-form";

const continueLabels = [
  "Continue to material",
  "Continue to size",
  "Continue to finish",
  "Continue to quantity",
  "Continue to review",
] as const;

function fileIssue(message: string): StudioValidationIssue {
  const tooLarge = message === "file_too_large";
  return {
    code: tooLarge ? "file_too_large" : "unsupported_file_type",
    field: "references",
    message: tooLarge ? "Choose a file no larger than 10 MB." : "Choose a supported reference file type.",
  };
}

export function StudioConfigurator() {
  const [draft, dispatch] = useReducer(studioReducer, undefined, createInitialStudioDraft);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const step = studioSteps[draft.currentStepIndex];

  useEffect(() => {
    if (draft.issues.length) {
      errorSummaryRef.current?.focus();
    }
  }, [draft.issues]);

  const validateCurrentStep = () => {
    const issues = validateStudioStep(draft, step);
    dispatch({ type: "set_issues", issues });
    return issues.length === 0;
  };

  const continueToNextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }
    dispatch({ type: "complete_step", stepIndex: draft.currentStepIndex });
    dispatch({ type: "set_step", stepIndex: draft.currentStepIndex + 1 });
    dispatch({ type: "set_status", message: `${step} complete.` });
  };

  const checkRequest = () => {
    if (!validateCurrentStep()) {
      return;
    }
    dispatch({ type: "complete_step", stepIndex: draft.currentStepIndex });
    dispatch({ type: "set_status", message: "Configuration complete. Quote submission is not available yet." });
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files?.length) {
      return;
    }
    const selections = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      fileName: file.name,
      byteLength: file.size,
    }));
    for (const selection of selections) {
      const result = referenceUploadMetadataSchema.safeParse(selection);
      if (!result.success) {
        dispatch({ type: "set_issues", issues: [fileIssue(result.error.issues[0]?.message ?? "unsupported_file_type")] });
        return;
      }
    }
    const nextReferences = [...draft.references];
    for (const selection of selections) {
      if (!nextReferences.some((reference) => reference.id === selection.id)) {
        nextReferences.push(selection);
      }
    }
    dispatch({ type: "set_references", value: nextReferences });
    dispatch({ type: "set_issues", issues: [] });
    dispatch({ type: "set_status", message: `${selections.length} reference file${selections.length === 1 ? "" : "s"} selected locally.` });
  };

  return (
    <section aria-label="Studio configurator" className={styles.configurator}>
      <ol aria-label="Studio progress" className={styles.progress}>
        {studioSteps.map((item, index) => {
          const isCurrent = index === draft.currentStepIndex;
          const isComplete = draft.completedStepIndexes.includes(index);
          const state = isCurrent ? "current" : isComplete ? "complete" : "not started";
          return (
            <li key={item}>
              <button
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${index + 1} of ${studioSteps.length}: ${item}, ${state}`}
                data-state={state}
                disabled={!isComplete || isCurrent}
                onClick={() => dispatch({ type: "set_step", stepIndex: index })}
                type="button"
              >
                <span>Step {index + 1} of {studioSteps.length}</span>
                <strong>{item}</strong>
                <small>{state}</small>
              </button>
            </li>
          );
        })}
      </ol>

      <div className={styles.workspace}>
        <div className={styles.editor}>
          <p className={styles.stepLabel}>Step {draft.currentStepIndex + 1} of {studioSteps.length} · {step}</p>
          {draft.issues.length ? (
            <div className={styles.errorSummary} ref={errorSummaryRef} role="alert" tabIndex={-1}>
              <h2>Check this step</h2>
              <ul>{draft.issues.map((issue) => <li key={`${issue.field}-${issue.code}`}>{issue.message}</li>)}</ul>
            </div>
          ) : null}
          <StudioStepForm draft={draft} dispatch={dispatch} onFilesSelected={handleFilesSelected} step={step} />
          <div className={styles.actions}>
            {draft.currentStepIndex > 0 ? (
              <button className={styles.secondaryAction} onClick={() => dispatch({ type: "set_step", stepIndex: draft.currentStepIndex - 1 })} type="button">Back</button>
            ) : null}
            {draft.currentStepIndex < studioSteps.length - 1 ? (
              <button className={styles.primaryAction} onClick={continueToNextStep} type="button">{continueLabels[draft.currentStepIndex]}</button>
            ) : (
              <>
                <button className={styles.primaryAction} onClick={checkRequest} type="button">Check request</button>
                <button className={styles.disabledAction} disabled type="button">Submit quote request</button>
              </>
            )}
          </div>
          <p aria-atomic="true" aria-live="polite" className={styles.status} role="status">{draft.statusMessage}</p>
        </div>
        <StudioReadout draft={draft} />
      </div>
    </section>
  );
}
