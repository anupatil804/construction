import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About us' },
  { to: '/services', label: 'Services' },
  { to: '/properties', label: 'Properties' },
  { to: '/contact', label: 'Contact' },
  { to: '/feedback', label: 'Feedback' },
];

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <ScrollToTop />
      <div className="topbar">
        <div className="site-container topbar-inner">
          <span>Thoughtful spaces. Built to last.</span>
          <div className="topbar-details">
            <a href="mailto:hello@oakandstonebuild.com">hello@oakandstonebuild.com</a>
            <span className="topbar-divider" aria-hidden="true" />
            <span>Mon – Fri, 8:00am – 6:00pm</span>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="site-container header-inner">
          <NavLink to="/" className="brand" aria-label="Oak and Stone Construction home" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="brand-name">oak &amp; stone<span>build</span></span>
          </NavLink>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
          <nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`} aria-label="Main navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
              Start a project <span aria-hidden="true">↗</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="site-container">
          <div className="footer-main">
            <div className="footer-about">
              <NavLink to="/" className="brand footer-brand" aria-label="Oak and Stone Construction home">
                <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
                <span className="brand-name">oak &amp; stone<span>build</span></span>
              </NavLink>
              <p>Building with intention. Creating spaces that bring people together and make every day feel a little more like home.</p>
            </div>
            <div className="footer-column">
              <span className="footer-label">Explore</span>
              <NavLink to="/about">Our story</NavLink>
              <NavLink to="/services">What we do</NavLink>
              <NavLink to="/properties">Properties</NavLink>
              <NavLink to="/feedback">Client stories</NavLink>
              <NavLink to="/admin">Admin panel</NavLink>
            </div>
            <div className="footer-column">
              <span className="footer-label">Get in touch</span>
              <a href="mailto:hello@oakandstonebuild.com">hello@oakandstonebuild.com</a>
              <NavLink to="/contact">Tell us about your project ↗</NavLink>
              <span>Serving the greater metro area</span>
            </div>
            <NavLink className="footer-contact-link" to="/contact" aria-label="Get in touch">
              ↗
            </NavLink>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Oak &amp; Stone Build Co. All rights reserved.</span>
            <span>Built with care, from the ground up.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Layout;
