import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";

const navigation = [
  { to: "/", label: "Home", end: true },
  { to: "/puppies", label: "Puppies" },
  { to: "/parents", label: "Parents" },
  { to: "/about", label: "About us" },
];

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export function SiteShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="site-frame">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ScrollToTop />
      <header className="site-header">
        <div className="nav-wrap">
          <Link className="brand" to="/" aria-label="Homestead Puppies home">
            <img src="/brand/logo.png" width="58" height="58" alt="" />
            <span>
              <strong>Homestead</strong>
              <small>Puppies</small>
            </span>
          </Link>

          <button
            className="menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="menu-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="sr-only">Toggle navigation</span>
          </button>

          <nav
            id="site-navigation"
            className={`site-nav${menuOpen ? " is-open" : ""}`}
            aria-label="Primary navigation"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink className="nav-deposit" to="/deposit">
              Place a deposit
            </NavLink>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <Link className="footer-brand" to="/">
              Homestead Puppies
            </Link>
            <p>
              A real family business, thoughtfully carried from a legacy EJS
              application into a modern React experience.
            </p>
          </div>
          <div>
            <h2>Explore</h2>
            <Link to="/puppies">Available puppies</Link>
            <Link to="/parents">Meet the parents</Link>
            <Link to="/deposit">Place a deposit</Link>
          </div>
          <div>
            <h2>Connect</h2>
            <a href="https://homestead-puppies.com/contact">Contact us</a>
            <a
              href="https://github.com/apelpapa/homestead-puppies-modern"
              target="_blank"
              rel="noreferrer"
            >
              View the React source
            </a>
            <a href="https://homestead-puppies.com">Visit the legacy site</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Homestead Puppies</span>
          <span>Family raised · Production proven</span>
        </div>
      </footer>
    </div>
  );
}
