import React from 'react';

function About() {
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
      <h1>About Us</h1>
      <p style={{ color: '#495057' }}>
        We are an e-commerce brand focused on fashion and quality, delivering the latest, trend-forward apparel collections.
        Our team curates global styles each season and ensures premium fabrics and craftsmanship, so you can wear confidence and express your style.
      </p>
      <h2>What We Offer</h2>
      <ul style={{ color: '#343a40' }}>
        <li>Newest men’s and women’s apparel, always on-trend.</li>
        <li>Carefully selected materials—comfortable, durable, and functional.</li>
        <li>From essentials to designer collaborations for diverse styles.</li>
      </ul>
      <h2>Why Choose Us</h2>
      <ul style={{ color: '#343a40' }}>
        <li>Fast shipping and hassle-free returns.</li>
        <li>Transparent pricing with seasonal promotions.</li>
        <li>Expert support to help you find the right fit and outfit.</li>
      </ul>
      <p style={{ marginTop: '20px', color: '#495057' }}>
        Explore our product page to find the latest arrivals and build your signature look.
      </p>
    </div>
  );
}

export default About;
