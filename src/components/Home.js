import { Link } from 'react-router-dom';
import './Home.css';

const services = [
  { number: '01', title: 'Custom homes', text: 'One-of-a-kind homes, thoughtfully designed around the way you want to live.', icon: '⌂' },
  { number: '02', title: 'Renovations', text: 'Considered updates that give the spaces you love a whole new chapter.', icon: '↗' },
  { number: '03', title: 'Commercial spaces', text: 'Warm, practical places for people to work, gather and grow together.', icon: '▦' },
];

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-image" />
        <div className="home-hero-shade" />
        <div className="site-container home-hero-content">
          <span className="eyebrow hero-eyebrow"><span /> BUILDING A BETTER EVERYDAY</span>
          <h1>Made for living.<br /><em>Built to last.</em></h1>
          <p>Good buildings do more than stand. They bring people together, make room for life, and feel right for years to come.</p>
          <div className="hero-actions">
            <Link to="/contact" className="button-primary hero-button">Let’s build something <span>↗</span></Link>
            <Link to="/about" className="hero-text-link">Get to know us <span>→</span></Link>
          </div>
        </div>
        <div className="hero-caption"><span>01 / 03</span><span>Grounded in good design</span></div>
        <div className="hero-scroll">SCROLL TO EXPLORE <span /></div>
      </section>

      <section className="home-intro section-space">
        <div className="site-container intro-grid">
          <div className="intro-copy">
            <span className="eyebrow"><span /> A DIFFERENT KIND OF BUILDER</span>
            <h2>Good work.<br />Good people.<br /><em>Better spaces.</em></h2>
            <p>At Oak &amp; Stone, we believe the best projects start with listening. We take the time to understand what matters to you, then bring the right people, care and craft to make it real.</p>
            <Link to="/about" className="text-link">A little about us <span>↗</span></Link>
          </div>
          <div className="intro-visual">
            <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1100&q=85" alt="Sculptural contemporary living space in warm natural tones" />
            <div className="intro-image-note"><span className="note-mark">O.</span><span>Spaces with a little<br />more soul.</span></div>
            <div className="intro-image-caption">A slower, more thoughtful way to build.</div>
          </div>
        </div>
      </section>

      <section className="home-services section-space">
        <div className="site-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span /> WHAT WE DO</span>
              <h2>From first sketch<br />to <em>final detail.</em></h2>
            </div>
            <p>Whether it’s a home made just for you or a space for your business, we bring the same care to every build.</p>
          </div>
          <div className="service-cards">
            {services.map((service) => (
              <Link to="/services" className="service-card" key={service.number}>
                <div className="service-card-top"><span>{service.number}</span><span className="service-icon" aria-hidden="true">{service.icon}</span></div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <span className="card-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-project">
        <img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2000&q=85" alt="Architect-designed home with a warm timber exterior and landscaped garden" />
        <div className="project-overlay" />
        <div className="site-container project-content">
          <span className="eyebrow hero-eyebrow"><span /> AN OAK &amp; STONE PROJECT</span>
          <h2>A home that<br /><em>feels like you.</em></h2>
          <p>We make room for the small things that make a place yours.</p>
          <Link to="/services" className="project-link">Explore our work <span>↗</span></Link>
        </div>
        <div className="project-caption">The Cedar House &nbsp;·&nbsp; Custom residential</div>
      </section>

      <section className="home-proof section-space">
        <div className="site-container proof-grid">
          <div className="proof-lead">
            <span className="eyebrow"><span /> THE NORTHLINE WAY</span>
            <h2>Built on<br /><em>the right things.</em></h2>
            <p>Good construction is about more than materials. It’s about trust, clarity and caring about every little detail.</p>
            <Link to="/services" className="text-link">How we work <span>↗</span></Link>
          </div>
          <div className="proof-stats">
            <div className="proof-stat"><strong>15<span>+</span></strong><span>years building with care</span></div>
            <div className="proof-stat"><strong>120</strong><span>projects and counting</span></div>
            <div className="proof-stat"><strong>100<span>%</span></strong><span>built around your needs</span></div>
          </div>
          <div className="proof-image">
            <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85" alt="Warm, thoughtfully designed contemporary home interior" />
          </div>
        </div>
      </section>

      <section className="home-quote">
        <div className="site-container quote-inner">
          <span className="quote-mark">“</span>
          <blockquote>They made the whole process feel easy—and the home feels like it was always meant to be ours.</blockquote>
          <div className="quote-credit"><span className="quote-line" /> An Oak &amp; Stone homeowner <span className="quote-dot">·</span> Cedar House</div>
          <Link to="/feedback" className="quote-link">More kind words <span>↗</span></Link>
        </div>
      </section>

      <section className="home-properties section-space">
        <div className="site-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span /> FIND YOUR PLACE</span>
              <h2>Room to make<br /><em>your own.</em></h2>
            </div>
            <div className="properties-heading-side">
              <p>Explore a handpicked collection of homes and upcoming developments, with thoughtful details from the ground up.</p>
              <Link to="/properties" className="text-link">Explore all properties <span>↗</span></Link>
            </div>
          </div>
          <div className="home-property-cards">
            <Link to="/properties" className="home-property-card">
              <div className="home-property-image"><img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85" alt="Contemporary family home with landscaped frontage" /><span>FOR SALE</span></div>
              <div className="home-property-info"><div><h3>The Willow House</h3><span>Northwood · Family home</span></div><strong>$1,245,000</strong></div>
            </Link>
            <Link to="/properties" className="home-property-card">
              <div className="home-property-image"><img src="https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1000&q=85" alt="Modern country home surrounded by mature trees" /><span>NEW RELEASE</span></div>
              <div className="home-property-info"><div><h3>Cedar Ridge</h3><span>Westhaven · New homes</span></div><strong>From $895,000</strong></div>
            </Link>
            <Link to="/properties" className="home-property-card">
              <div className="home-property-image"><img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85" alt="Warmly lit modern townhouse interior" /><span>COMING SOON</span></div>
              <div className="home-property-info"><div><h3>The Grove Residences</h3><span>Riverside · Townhomes</span></div><strong>From $749,000</strong></div>
            </Link>
          </div>
          <p className="property-disclaimer">Property details shown for demonstration. Availability and pricing are illustrative.</p>
        </div>
      </section>

      <section className="home-contact">
        <div className="site-container contact-banner">
          <div><span className="eyebrow"><span /> YOUR NEXT CHAPTER STARTS HERE</span><h2>Have a good one<br /><em>in mind?</em></h2></div>
          <Link to="/contact" className="button-primary">Tell us about it <span>↗</span></Link>
          <span className="banner-decoration" aria-hidden="true">O.</span>
        </div>
      </section>
    </div>
  );
}

export default Home;
