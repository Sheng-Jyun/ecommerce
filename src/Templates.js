import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { key: 'fashion', name: 'Clothing Store', img: '/images/templates/fashion.png', desc: 'Modern apparel storefronts and lookbooks.' },
  { key: 'electronics', name: 'Electronics Store', img: '/images/templates/electronics.png', desc: 'Gadgets, devices, and tech accessories.' },
  { key: 'blog', name: 'Personal Blog', img: '/images/templates/blog.png', desc: 'Clean, content-focused blogging templates.' },
  { key: 'government', name: 'Government Site', img: '/images/templates/government.png', desc: 'Information portals and citizen services.' },
  { key: 'food-store', name: 'Food & Groceries', img: '/images/templates/food.png', desc: 'Restaurants, cafes, bakeries, and grocery shops.' },
  { key: 'furniture-store', name: 'Furniture Store', img: '/images/templates/furniture.png', desc: 'Home decor, furnishings, and showroom catalogs.' },
];

function Templates() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <h1>Website Templates Marketplace</h1>
      <p style={{ color: '#495057' }}>Browse ready-made website templates. Pick a category to see variations.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {categories.map(cat => (
          <Link key={cat.key} to={`/templates/${cat.key}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #e9ecef', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ height: 140, background: `url(${cat.img}) center/cover, #dee2e6` }} />
              <div style={{ padding: 12 }}>
                <h3 style={{ margin: '0 0 6px 0' }}>{cat.name}</h3>
                <p style={{ margin: 0, color: '#6c757d' }}>{cat.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Templates;
