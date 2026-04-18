import Link from "next/link";
import { productVisionRows } from "@/lib/homepage-content";

export function ProductVision() {
  return (
    <section className="section">
      <div className="page-shell">
        <h2 className="section-title product-vision-title">
          Our offerings.
        </h2>

        <div className="vision-grid">
          {productVisionRows.map((row) => (
            <div
              key={row.title}
              className={`grain-card vision-card${
                row.status === "Live now" ? " is-live" : " is-soon"
              }`}
            >
              <div className="vision-card-top">
                <div className="vision-card-heading">
                  <span
                    className={`vision-status-badge${
                      row.status === "Live now" ? " is-live" : " is-soon"
                    }`}
                  >
                    {row.status}
                  </span>
                  <h3 className="vision-card-title">{row.title}</h3>
                </div>
              </div>

              <div className="vision-card-body">
                <ul className="vision-card-list" aria-label={`${row.title} offerings`}>
                  {row.items.map((item) => (
                    <li key={item} className="vision-card-item">
                      {item}
                    </li>
                  ))}
                </ul>

                {"href" in row && "cta" in row ? (
                  <Link href={row.href} className="vision-card-link">
                    {row.cta}
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
