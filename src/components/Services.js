import { Link } from 'react-router-dom';
import './Services.css';

const offerings = [
  { number: '01', title: 'Custom homes', tag: 'MADE AROUND YOU', text: 'A home should feel like it could only belong to you. We work closely with you, your architect and our trusted trades to bring a considered, character-filled home to life.', details: ['Pre-construction planning', 'New home construction', 'Design & build coordination'], image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85', alt: 'Architect-designed custom home with landscaped frontage' },
  { number: '02', title: 'Renovations & additions', tag: 'A NEW CHAPTER', text: 'Keep the things you love. Reimagine the ones you don’t. From a kitchen that works harder to a new room that makes space for what’s next, we make change feel considered.', details: ['Whole-home renovations', 'Kitchens & bathrooms', 'Extensions & additions'], image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85', alt: 'Refined renovated home with warm natural finishes' },
  { number: '03', title: 'Commercial construction', tag: 'ROOM TO GROW', text: 'From welcoming studios to thoughtful workplaces, we create practical places where teams can do their best work and businesses can find their next step.', details: ['Office & workplace fit-outs', 'Retail & hospitality spaces', 'Small-scale developments'], image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85', alt: 'Contemporary commercial office and collaboration space' },
  { number: '04', title: 'Design & build', tag: 'ONE TEAM, ONE VISION', text: 'Bring the design and construction teams together from day one. One accountable team helps you make informed decisions, understand costs and keep the details working together.', details: ['Architectural coordination', 'Pre-construction estimates', 'Materials & finish selections'], image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85', alt: 'Builder coordinating the details of a construction project' },
  { number: '05', title: 'Property development', tag: 'THOUGHTFUL BY DESIGN', text: 'We shape considered residential projects from early feasibility through delivery, bringing long-term value and a sense of place to every development.', details: ['Site feasibility', 'Residential developments', 'Townhomes & infill projects'], image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85', alt: 'Modern residential property surrounded by gardens' },
  { number: '06', title: 'Project management', tag: 'GOOD HANDS, ALL THE WAY', text: 'A trusted partner to keep your build organized. We coordinate schedules, trades, decisions and communication so nothing important gets lost in the details.', details: ['Construction scheduling', 'Trade coordination', 'Quality checks & handover'], image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=85', alt: 'Builder and project team coordinating a construction project' },
];

function Services() {
  return (
    <div className="services-page">
      <section className="services-hero">
        <div className="site-container services-hero-inner">
          <div>
            <span className="eyebrow"><span /> WHAT WE DO</span>
            <h1>Good work,<br />from <em>the ground up.</em></h1>
            <p>We bring good people, thoughtful planning and a steady hand to every kind of build.</p>
          </div>
          <div className="services-hero-photo">
            <img src="https://images.unsplash.com/photo-1600047509782-20d39509f26d?auto=format&fit=crop&w=1200&q=85" alt="Architectural home with sculptural contemporary design" />
            <span className="services-photo-caption">THOUGHTFULLY BUILT, TOGETHER.</span>
          </div>
          <span className="services-hero-number">01—06</span>
        </div>
      </section>

      <section className="services-list section-space">
        <div className="site-container">
          <div className="services-list-heading">
            <span className="eyebrow"><span /> HOW WE CAN HELP</span>
            <p>From finding a site to the finishing touches, here are six ways our team can help make your plans real.</p>
          </div>
          <div>
            {offerings.map((service) => (
              <article className="offering" key={service.number}>
                <div className="offering-meta"><span>{service.number}</span><span>{service.tag}</span></div>
                <div className="offering-main">
                  <h2>{service.title}</h2>
                  <p>{service.text}</p>
                  <ul>{service.details.map((detail) => <li key={detail}><span>↗</span>{detail}</li>)}</ul>
                  <Link to="/contact" className="text-link">Let’s talk about it <span>↗</span></Link>
                </div>
                <img src={service.image} alt={service.alt} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-process">
        <div className="site-container process-inner">
          <div><span className="eyebrow"><span /> SIMPLE, FROM THE START</span><h2>Clear steps.<br /><em>No surprises.</em></h2></div>
          <div className="process-steps">
            <div><span>01</span><p>We listen & learn</p></div>
            <div><span>02</span><p>We plan it together</p></div>
            <div><span>03</span><p>We build with care</p></div>
            <div><span>04</span><p>We hand over the keys</p></div>
          </div>
          <Link to="/contact" className="button-primary">Tell us what you’re planning <span>↗</span></Link>
        </div>
      </section>
    </div>
  );
}

export default Services;
