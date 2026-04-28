const footerGroups = [
  {
    title: "Company",
    links: ["About", "Careers", "Contact"]
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms"]
  },
  {
    title: "Product",
    links: ["Shop"]
  },
  {
    title: "Social",
    links: ["Instagram", "TikTok", "YouTube", "Reddit"]
  }
] as const;

export function SiteFooter() {
  return (
    <footer className="section site-footer-section">
      <div className="page-shell">
        <div className="grain-card site-footer-card">
          <div className="site-footer-top">
            <div className="site-footer-intro">
              <div className="section-label">Footer</div>
              <h2 className="site-footer-title">Stay close to the flock without living online.</h2>
              <p className="site-footer-copy">
                Get practical updates, product notes, and the next community drops when they are worth your time.
              </p>
            </div>

            <form className="site-footer-signup" action="#">
              <label className="site-footer-label" htmlFor="homepage-email">
                Join the community
              </label>
              <div className="site-footer-form-row">
                <input
                  id="homepage-email"
                  type="email"
                  placeholder="Email address"
                  className="site-footer-input"
                />
                <button type="submit" className="site-footer-button">
                  Get updates
                </button>
              </div>
            </form>
          </div>

          <div className="site-footer-grid">
            {footerGroups.map((group) => (
              <div key={group.title} className="site-footer-group">
                <h3 className="site-footer-group-title">{group.title}</h3>
                <div className="site-footer-links">
                  {group.links.map((link) => (
                    <a key={link} href="#" className="site-footer-link">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
