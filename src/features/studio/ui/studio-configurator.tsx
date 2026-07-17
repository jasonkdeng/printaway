"use client";

import Link from "next/link";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import { referenceUploadMetadataSchema } from "@/features/studio/domain/reference-upload";
import {
  createInitialStudioDraft,
  studioReducer,
  validateStudioStep,
  type StudioValidationIssue,
} from "@/features/studio/domain/studio-draft";
import { configurationFromDraft, validateStudioCapabilities } from "@/features/studio/domain/studio-configuration";
import type { StudioCapabilities } from "@/features/studio/domain/studio-configuration";
import type { StudioEstimate } from "@/features/studio/domain/studio-estimate";
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

type SubmissionState = "idle" | "validating" | "preparing" | "uploading" | "finalizing" | "success" | "failure";

export function StudioConfigurator({ submissionEnabled = false, capabilities = null }: { submissionEnabled?: boolean; capabilities?: StudioCapabilities | null }) {
  const [draft, dispatch] = useReducer(studioReducer, undefined, createInitialStudioDraft);
  const [estimate, setEstimate] = useState<StudioEstimate | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [publicReference, setPublicReference] = useState<string | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const filesRef = useRef(new Map<string, File>());
  const idempotencyKeyRef = useRef<string | null>(null);
  const idempotencyFingerprintRef = useRef<string | null>(null);
  const estimateRequestRef = useRef(0);
  const step = studioSteps[draft.currentStepIndex];
  const { description, references, material, dimensions, finish, quantity } = draft;
  const reviewConfiguration = useMemo(
    () => configurationFromDraft({ description, references, material, dimensions, finish, quantity }),
    [description, references, material, dimensions, finish, quantity],
  );

  useEffect(() => {
    if (draft.issues.length) {
      errorSummaryRef.current?.focus();
    }
  }, [draft.issues]);

  useEffect(() => {
    if (draft.currentStepIndex !== studioSteps.length - 1) return;
    const configuration = reviewConfiguration;
    if (!configuration) return;
    const controller = new AbortController();
    const requestId = estimateRequestRef.current + 1;
    estimateRequestRef.current = requestId;
    dispatch({ type: "set_status", message: "Updating estimate." });
    fetch("/api/studio/estimate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(configuration),
      signal: controller.signal,
    }).then(async (response) => {
      const result = await response.json() as StudioEstimate;
      if (estimateRequestRef.current !== requestId) return;
      setEstimate(response.ok ? result : { status: "unavailable", code: "service_unavailable", values: null });
      dispatch({ type: "set_status", message: result.status === "unavailable" ? "Estimate unavailable." : "Manual review required." });
    }).catch(() => {
      if (controller.signal.aborted || estimateRequestRef.current !== requestId) return;
      setEstimate({ status: "unavailable", code: "service_unavailable", values: null });
      dispatch({ type: "set_status", message: "Estimate unavailable." });
    });
    return () => controller.abort();
  }, [draft.currentStepIndex, reviewConfiguration]);

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
    for (const file of files) {
      const selection = selections.find((item) => item.fileName === file.name && item.byteLength === file.size);
      if (selection) filesRef.current.set(selection.id, file);
    }
    dispatch({ type: "set_references", value: nextReferences });
    dispatch({ type: "set_issues", issues: [] });
    dispatch({ type: "set_status", message: `${selections.length} reference file${selections.length === 1 ? "" : "s"} selected locally.` });
  };

  const submitQuoteRequest = async () => {
    const issues = validateStudioStep(draft, step);
    if (issues.length) {
      dispatch({ type: "set_issues", issues });
      return;
    }
    const configuration = configurationFromDraft(draft);
    if (!configuration) {
      dispatch({ type: "set_issues", issues: [{ code: "reference_required", field: "description", message: "Check the configuration before submitting." }] });
      return;
    }
    const capabilityIssues = validateStudioCapabilities(configuration, capabilities).map((issue) => ({
      code: issue.code,
      field: issue.field,
      message: issue.message,
    }));
    if (capabilityIssues.length) {
      dispatch({ type: "set_issues", issues: capabilityIssues });
      return;
    }
    setSubmissionState("preparing");
    dispatch({ type: "set_status", message: "Preparing quote request." });
    try {
      const fingerprint = JSON.stringify({ configuration, contact: draft.contact, privacyConsent: draft.privacyConsent });
      if (idempotencyFingerprintRef.current !== fingerprint) {
        idempotencyFingerprintRef.current = fingerprint;
        idempotencyKeyRef.current = crypto.randomUUID();
      }
      const preparedResponse = await fetch("/api/studio/quote/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ configuration, contact: draft.contact, consent: { privacyConsent: draft.privacyConsent }, idempotencyKey: idempotencyKeyRef.current }),
      });
      if (!preparedResponse.ok) throw new Error("prepare_failed");
      const prepared = await preparedResponse.json() as { intentId: string; uploads: Array<{ referenceId: string; signedUploadUrl: string }> };
      if (prepared.uploads.length) {
        setSubmissionState("uploading");
        dispatch({ type: "set_status", message: "Uploading references." });
        await Promise.all(prepared.uploads.map(async (upload) => {
          const file = filesRef.current.get(upload.referenceId);
          if (!file) throw new Error("missing_file");
          const response = await fetch(upload.signedUploadUrl, { method: "PUT", body: file, headers: { "content-type": file.type || "application/octet-stream", "x-upsert": "false" } });
          if (!response.ok) throw new Error("upload_failed");
        }));
      }
      setSubmissionState("finalizing");
      dispatch({ type: "set_status", message: "Submitting request." });
      const finalizedResponse = await fetch("/api/studio/quote/finalize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intentId: prepared.intentId }),
      });
      if (!finalizedResponse.ok) throw new Error("finalize_failed");
      const finalized = await finalizedResponse.json() as { publicReference: string };
      setPublicReference(finalized.publicReference);
      setSubmissionState("success");
      dispatch({ type: "set_status", message: "Quote request received." });
    } catch {
      setSubmissionState("failure");
      dispatch({ type: "set_status", message: "The request wasn't submitted. Your configuration is still here." });
    }
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
          <StudioStepForm
            draft={draft}
            dispatch={dispatch}
            onFilesSelected={handleFilesSelected}
            onRemoveReference={(id) => filesRef.current.delete(id)}
            capabilities={capabilities}
            step={step}
          />
          <div className={styles.actions}>
            {draft.currentStepIndex > 0 ? (
              <button className={styles.secondaryAction} onClick={() => dispatch({ type: "set_step", stepIndex: draft.currentStepIndex - 1 })} type="button">Back</button>
            ) : null}
            {draft.currentStepIndex < studioSteps.length - 1 ? (
              <button className={styles.primaryAction} onClick={continueToNextStep} type="button">{continueLabels[draft.currentStepIndex]}</button>
            ) : (
              submissionState === "success" ? (
                <div className={styles.successNotice}><strong>Quote request received</strong><span>Reference: {publicReference}</span><Link href="/">Return home</Link></div>
              ) : submissionEnabled ? (
                <button className={styles.primaryAction} disabled={submissionState === "preparing" || submissionState === "uploading" || submissionState === "finalizing"} onClick={submitQuoteRequest} type="button">
                  {submissionState === "preparing" ? "Preparing request" : submissionState === "uploading" ? "Uploading references" : submissionState === "finalizing" ? "Submitting request" : "Submit quote request"}
                </button>
              ) : (
                <>
                  <button className={styles.primaryAction} onClick={checkRequest} type="button">Check request</button>
                  <button className={styles.disabledAction} disabled type="button">Submit quote request</button>
                </>
              )
            )}
          </div>
          <p aria-atomic="true" aria-live="polite" className={styles.status} role="status">{draft.statusMessage}</p>
        </div>
        <StudioReadout draft={draft} estimate={estimate} />
      </div>
    </section>
  );
}
