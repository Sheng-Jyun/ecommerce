import React from 'react';

function About() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Hero / Company Intro */}
      <section style={{
        background: 'linear-gradient(135deg, #6f42c1 0%, #9d4edd 100%)',
        color: '#fff',
        padding: '60px 20px',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '40px' }}>Website Templates</h1>
          <p style={{ marginTop: '14px', fontSize: '18px', opacity: 0.95 }}>
            We design clean, conversion‑focused templates for stores, blogs, and public sector sites.
            Pick a template, add to cart, and no‑code required.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
            <a href="/templates" style={{
              background: '#fff', color: '#6f42c1', padding: '10px 16px', borderRadius: 8,
              textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>Browse Templates</a>
            <a href="/chat" style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '10px 16px', borderRadius: 8,
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.5)'
            }}>Ask the Assistant</a>
          </div>
        </div>
      </section>

      {/* Template Categories */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ marginTop: 0 }}>Popular Template Categories</h2>
        <p style={{ color: '#495057' }}>Explore professionally designed templates and start quickly.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {/* Cards */}
          {[
            { title: 'Clothing Store', desc: 'Modern retail layouts with product grids and promos.', link: '/templates/fashion' },
            { title: 'Electronics Store', desc: 'Tech‑oriented pages with filters and specs blocks.', link: '/templates/electronics' },
            { title: 'Personal Blog', desc: 'Clean blog designs with tags, search, and newsletter.', link: '/templates/blog' },
            { title: 'Government Site', desc: 'Accessible, structured layouts for services and info.', link: '/templates/government' },
            { title: 'Food & Groceries', desc: 'Menus, online ordering, and store catalogs.', link: '/templates/food-store' },
            { title: 'Furniture Store', desc: 'Showroom catalogs, collections, and room sets.', link: '/templates/furniture-store' },
          ].map((c, i) => (
            <div key={i} style={{
              border: '1px solid #e9ecef', borderRadius: 10, padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ margin: '0 0 8px 0' }}>{c.title}</h3>
              <p style={{ margin: 0, color: '#495057' }}>{c.desc}</p>
              <div style={{ marginTop: 12 }}>
                <a href={c.link} style={{
                  background: '#6f42c1', color: '#fff', padding: '8px 12px', borderRadius: 6,
                  textDecoration: 'none'
                }}>Explore Templates</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founder & Philosophy */}
      <section style={{
        background: '#f8f9fa', borderTop: '1px solid #e9ecef', borderBottom: '1px solid #e9ecef',
        padding: '40px 20px'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {/* Founder */}
            <div style={{
              border: '1px solid #e9ecef', borderRadius: 12, background: '#fff', padding: 18,
              textAlign: 'center', minWidth: 140, maxWidth: 180, margin: '0 auto'
            }}>
              <img src="/images/team/fud.png" alt="Jim Cai" style={{ width: 80, height: 80, objectFit: 'cover', display: 'block', margin: '24px auto 8px auto' }} />
              <div>
                <strong>Jim Cai</strong>
                <div style={{ color: '#6c757d' }}>Founder</div>
              </div>
            </div>
            {/* CPO */}
            <div style={{
              border: '1px solid #e9ecef', borderRadius: 12, background: '#fff', padding: 18,
              textAlign: 'center', minWidth: 140, maxWidth: 180, margin: '0 auto'
            }}>
              <img src="/images/team/cpo.png" alt="Tzu-Hsuan Liao" style={{ width: 80, height: 80, objectFit: 'cover', display: 'block', margin: '24px auto 8px auto' }} />
              <div>
                <strong>Tzu-Hsuan Liao</strong>
                <div style={{ color: '#6c757d' }}>Chief Product Officer</div>
              </div>
            </div>
            {/* Chief Technology Officer 1*/}
            <div style={{
              border: '1px solid #e9ecef', borderRadius: 12, background: '#fff', padding: 18,
              textAlign: 'center', minWidth: 140, maxWidth: 180, margin: '0 auto'
            }}>
              <img src="/images/team/cto.png" alt="James" style={{ width: 80, height: 80, objectFit: 'cover', display: 'block', margin: '24px auto 8px auto' }} />
              <div>
                <strong>James</strong>
                <div style={{ color: '#6c757d' }}>Chief Technology Officer</div>
              </div>
            </div>
          </div>
          <div>
            <h2 style={{ marginTop: 0 }}>Our Philosophy</h2>
            <p style={{ color: '#495057' }}>
              We believe great websites should be accessible, fast, and easy to launch.
              Our templates focus on clarity, performance, and thoughtful UX—so you can go live sooner.
            </p>
            <ul style={{ color: '#343a40' }}>
              <li>Clean, accessible design patterns.</li>
              <li>Performance‑minded components.</li>
              <li>Zero‑code setup and customization.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact & Address */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
        <h2 style={{ marginTop: 0 }}>Contact Us</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ border: '1px solid #e9ecef', borderRadius: 10, padding: 16 }}>
            <h4 style={{ marginTop: 0 }}>Get in touch</h4>
            <p style={{ margin: 0 }}>
              Email: <a href="mailto:support@ecommerce.example">support@ecommerce.example</a><br />
              Phone: <a href="tel:+1-555-123-4567">+1 (555) 123-4567</a>
            </p>
          </div>
          <div style={{ border: '1px solid #e9ecef', borderRadius: 10, padding: 16 }}>
            <h4 style={{ marginTop: 0 }}>Visit us</h4>
            <p style={{ margin: 0 }}>
              123 Web Ave, Suite 500<br />
              Columbus, OH 43215, USA
            </p>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <a href="/templates" style={{
            background: '#0d6efd', color: '#fff', padding: '10px 16px', borderRadius: 8,
            textDecoration: 'none'
          }}>Browse Templates</a>
        </div>
      </section>
    </div>
  );
}

export default About;
