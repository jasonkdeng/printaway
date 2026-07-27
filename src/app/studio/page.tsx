import { StudioConfigurator } from "@/features/studio/ui/studio-configurator";
import { getStudioServerConfiguration } from "@/server/config/studio";

import styles from "./studio.module.css";

export const metadata = { title: "Studio" };

export default function StudioPage() {
  const studio = getStudioServerConfiguration();
  const submissionMessage = studio.submissionEnabled
    ? "Build a clear request in six focused steps. Material, fit, timing, and cost require manual review. Your request can be submitted for manual review."
    : "Build a clear request in six focused steps. Material, fit, timing, and cost require manual review. Quote submission is not available yet.";
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>{"// Studio / Custom print"}</p>
        <h1>Configure a print with control.</h1>
        <p>{submissionMessage}</p>
      </header>
      <StudioConfigurator capabilities={studio.capabilities} submissionEnabled={studio.submissionEnabled} />
    </main>
  );
}
