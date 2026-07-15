import { StudioConfigurator } from "@/features/studio/ui/studio-configurator";

import styles from "./studio.module.css";

export const metadata = { title: "Studio" };

export default function StudioPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>{"// Studio / Custom print"}</p>
        <h1>Configure a print with control.</h1>
        <p>Build a clear request in six focused steps. Material, fit, timing, and cost require manual review. Quote submission is not available yet.</p>
      </header>
      <StudioConfigurator />
    </main>
  );
}
