import type { StudioDraft } from "@/features/studio/domain/studio-draft";

import styles from "./studio-configurator.module.css";

function formatSize(draft: StudioDraft): string {
  const { lengthMm, widthMm, heightMm } = draft.dimensions;
  return lengthMm && widthMm && heightMm ? `${lengthMm} × ${widthMm} × ${heightMm} mm` : "—";
}

export function StudioReadout({ draft }: { draft: StudioDraft }) {
  const values = [
    ["Material", draft.material ?? "—"],
    ["Size", formatSize(draft)],
    ["Finish", draft.finish ?? "—"],
    ["Quantity", draft.quantity || "—"],
    ["Est. material", "—"],
    ["Est. print time", "—"],
    ["Est. cost", "—"],
  ] as const;

  return (
    <aside aria-labelledby="readout-heading" className={styles.readout}>
      <div className={styles.readoutHeader}>
        <p id="readout-heading">Live readout</p>
        <span>Manual review required</span>
      </div>
      <dl>
        {values.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.readoutNote}>No material, time, cost, or manufacturability estimate is calculated in this foundation.</p>
    </aside>
  );
}
