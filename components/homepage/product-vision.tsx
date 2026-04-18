import Link from "next/link";
import { productVisionRows } from "@/lib/homepage-content";

export function ProductVision() {
  return (
    <section className="section">
      <div className="page-shell page-shell-wide">
        <div className="section-label">Our vision for Ugly Manling</div>
        <h2 className="section-title">Join us to build the flock's support system.</h2>
        <p className="section-copy">
          Five lanes. Two live now. Three coming next.
        </p>

        <div className="vision-grid">
          {productVisionRows.map((row) => (
            <div
              key={row.title}
              className={`grain-card vision-card${
                row.status === "Live now" ? " is-live" : " is-soon"
              }`}
            >
              <div className="vision-card-top">
                <span
                  className={`vision-status-badge${
                    row.status === "Live now" ? " is-live" : " is-soon"
                  }`}
                >
                  {row.status}
                </span>
                <h3 className="vision-card-title">{row.title}</h3>
              </div>

              <p className="vision-card-copy">{row.summary}</p>

              <ul className="vision-card-list">
                {row.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {"href" in row && "cta" in row ? (
                <Link href={row.href} className="vision-card-link">
                  {row.cta}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
