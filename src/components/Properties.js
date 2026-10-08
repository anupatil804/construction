import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Properties.css';

const properties = [
  {
    name: 'The Willow House',
    location: 'Northwood, North District',
    type: 'sale',
    status: 'For sale',
    price: '$1,245,000',
    beds: 4,
    baths: 3,
    area: '2,480 sq ft',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85',
    alt: 'Modern family home with pale stone facade and landscaped frontage',
  },
  {
    name: 'Cedar Ridge',
    location: 'Westhaven, Cedar Valley',
    type: 'new',
    status: 'New homes',
    price: 'From $895,000',
    beds: 3,
    baths: 2,
    area: '1,920 sq ft',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=85',
    alt: 'Newly built modern home with a landscaped garden and timber details',
  },
  {
    name: 'The Grove Residences',
    location: 'Riverside, East Quarter',
    type: 'new',
    status: 'Coming soon',
    price: 'From $749,000',
    beds: 3,
    baths: 2,
    area: '1,650 sq ft',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85',
    alt: 'Contemporary home interior with warm, light-filled living spaces',
  },
  {
    name: 'Oakview Cottage',
    location: 'Maple Grove, North District',
    type: 'sale',
    status: 'For sale',
    price: '$928,000',
    beds: 3,
    baths: 2,
    area: '1,780 sq ft',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85',
    alt: 'Welcoming cottage-style home with modern architecture',
  },
  {
    name: 'Stonebridge House',
    location: 'Old Town, West Quarter',
    type: 'sale',
    status: 'For sale',
    price: '$1,680,000',
    beds: 5,
    baths: 4,
    area: '3,120 sq ft',
    image: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1000&q=85',
    alt: 'Spacious contemporary home with refined architectural finishes',
  },
  {
    name: 'Juniper Townhomes',
    location: 'Southbank, Garden District',
    type: 'new',
    status: 'New homes',
    price: 'From $685,000',
    beds: 2,
    baths: 2,
    area: '1,410 sq ft',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',
    alt: 'Modern townhome with a carefully designed open-plan living space',
  },
];

const filters = [
  { value: 'all', label: 'All properties' },
  { value: 'sale', label: 'For sale' },
  { value: 'new', label: 'New homes' },
];

function Properties() {
  const [activeFilter, setActiveFilter] = useState('all');
  const visibleProperties = activeFilter === 'all'
    ? properties
    : properties.filter((property) => property.type === activeFilter);

  return (
    <div className="properties-page">
      <section className="properties-hero">
        <img src="https://images.unsplash.com/photo-1600047509782-20d39509f26d?auto=format&fit=crop&w=2000&q=85" alt="Architect-designed home surrounded by mature trees" />
        <div className="properties-hero-shade" />
        <div className="site-container properties-hero-content">
          <span className="eyebrow properties-eyebrow"><span /> FIND A PLACE TO CALL YOURS</span>
          <h1>Good homes.<br /><em>Good beginnings.</em></h1>
          <p>Thoughtfully built places, ready for whatever comes next.</p>
          <a className="properties-hero-link" href="#available-homes">Explore the collection <span>↓</span></a>
        </div>
        <span className="properties-hero-caption">A home is more than a place. It’s a feeling.</span>
      </section>

      <section className="properties-collection section-space" id="available-homes">
        <div className="site-container">
          <div className="properties-intro">
            <div>
              <span className="eyebrow"><span /> A PLACE WITH YOUR NAME ON IT</span>
              <h2>Find your <em>somewhere.</em></h2>
            </div>
            <p>Discover a collection of considered homes and new communities, each designed with care and built for real life.</p>
          </div>
          <div className="property-filters" role="group" aria-label="Filter properties">
            {filters.map((filter) => (
              <button
                className={activeFilter === filter.value ? 'property-filter active' : 'property-filter'}
                type="button"
                key={filter.value}
                aria-pressed={activeFilter === filter.value}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
                {filter.value === 'all' && <span>{properties.length}</span>}
              </button>
            ))}
            <span className="property-results">{visibleProperties.length} properties</span>
          </div>
          <div className="property-grid">
            {visibleProperties.map((property, index) => (
              <article className="property-card" key={property.name}>
                <div className="property-photo">
                  <img src={property.image} alt={property.alt} loading={index > 2 ? 'lazy' : 'eager'} />
                  <span className="property-status">{property.status}</span>
                  <span className="property-number">O&amp;S / {String(properties.indexOf(property) + 1).padStart(2, '0')}</span>
                </div>
                <div className="property-card-body">
                  <span className="property-location">{property.location}</span>
                  <div className="property-card-heading"><h3>{property.name}</h3><strong>{property.price}</strong></div>
                  <div className="property-specs">
                    <span>{property.beds} beds</span><span>{property.baths} baths</span><span>{property.area}</span>
                  </div>
                  <Link to="/contact" className="property-details-link">Enquire about this home <span>↗</span></Link>
                </div>
              </article>
            ))}
          </div>
          <p className="property-disclaimer">Sample property names, locations, availability and pricing are for demonstration only and do not represent active listings.</p>
        </div>
      </section>

      <section className="properties-cta">
        <div className="site-container properties-cta-inner">
          <div><span className="eyebrow"><span /> CAN’T FIND THE ONE?</span><h2>Let’s make a place<br /><em>that feels like yours.</em></h2><p>Tell us what you’re looking for. We can help you find the right home or build one from the ground up.</p></div>
          <Link to="/contact" className="button-primary">Talk to our team <span>↗</span></Link>
          <span className="properties-cta-mark" aria-hidden="true">O.</span>
        </div>
      </section>
    </div>
  );
}

export default Properties;
