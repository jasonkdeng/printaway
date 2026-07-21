import Link from "next/link";

import { studioSteps } from "@/features/studio/domain/studio-steps";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <section className={styles.surface}>
      <section aria-labelledby="shop-heading" className={styles.shop}>
        <div aria-hidden="true" className={styles.spotlight}>
          <span className={styles.lightHousing} />
          <svg className={styles.lightBeam} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <radialGradient id="shop-light-beam" cx="50%" cy="0%" r="86%">
                <stop className={styles.lightBeamCore} offset="0%" />
                <stop className={styles.lightBeamMiddle} offset="48%" />
                <stop className={styles.lightBeamEdge} offset="82%" />
              </radialGradient>
            </defs>
            <path d="M46 0 H54 L92 70 Q50 100 8 70 Z" fill="url(#shop-light-beam)" />
          </svg>
        </div>
        <div className={styles.shopContent}>
          <p className={styles.sectionLabel}>{"// Shop"}</p>
          <h1 id="shop-heading" className={styles.shopHeading}>Objects made in small runs.</h1>
          <p className={styles.shopCopy}>The catalog will appear here when approved product data and media are available.</p>
          <div aria-label="Catalog pending approved content" className={styles.gallery}>
            {Array.from({ length: 6 }, (_, index) => <div aria-hidden="true" className={styles.galleryCell} key={index} />)}
          </div>
          <Link className={styles.shopLink} href="/shop">View the full Shop <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <section aria-labelledby="studio-heading" className={styles.studio}>
        <div className={styles.studioContent}>
          <p className={styles.sectionLabel}>{"// Studio"}</p>
          <h2 id="studio-heading" className={styles.studioHeading}>Configure a print with control.</h2>
          <p className={styles.studioCopy}>A focused custom-print enquiry, structured around the decisions that matter.</p>
          <div className={styles.consoleHeader}>Studio console</div>
          <ol className={styles.steps}>
            {studioSteps.map((step, index) => <li className={styles.step} key={step}><span>Step {index + 1} of {studioSteps.length}</span><strong>{step}</strong></li>)}
          </ol>
          <div className={styles.consoleFooter}><span>[ Console ready ]</span><Link href="/studio">Configure a print</Link></div>
        </div>
      </section>
    </section>
  );
}
