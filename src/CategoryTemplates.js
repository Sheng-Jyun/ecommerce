import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// 前端自己維護：每個模板的圖片
const IMAGE_MAP = {
  'fashion-hero': '/images/templates/fashion-hero.png',
  'fashion-minimal': '/images/templates/fashion-minimal.png',
  'electronics-pro': '/images/templates/electronics-pro.png',
  'electronics-minimal': '/images/templates/electronics-minimal.png',
  'blog-clean': '/images/templates/blog-clean.png',
  'blog-magazine': '/images/templates/blog-mag.png',
  'gov-portal': '/images/templates/gov-portal.png',
  'gov-accessible': '/images/templates/gov-accessible.png',
  'food-restaurant': '/images/templates/food-restaurant.png',
  'food-grocery': '/images/templates/food-grocery.png',
  'food-bakery': '/images/templates/food-bakery.png',
  'furn-showroom': '/images/templates/furniture-showroom.png',
  'furn-minimal': '/images/templates/furniture-minimal.png',
  'furn-luxe': '/images/templates/furniture-luxe.png',
};

// 前端自己維護：每個模板的 features
const FEATURES_MAP = {
  'fashion-hero': ['Hero banner', 'Product grid', 'Lookbook section'],
  'fashion-minimal': ['Minimal nav', 'Collections', 'Newsletter'],
  'electronics-pro': ['Specs table', 'Accessory bundles', 'Support FAQ'],
  'electronics-minimal': ['Card grid', 'Promo banners', 'Store locator'],
  'blog-clean': ['Article list', 'Tags', 'RSS'],
  'blog-magazine': ['Featured posts', 'Category sections', 'Newsletter'],
  'gov-portal': ['Service directory', 'Announcements', 'Forms'],
  'gov-accessible': ['WCAG focus', 'High contrast', 'Search'],
  'food-restaurant': ['Menu pages', 'Reservations', 'Gallery'],
  'food-grocery': ['Category filters', 'Promo banners', 'Store locator'],
  'food-bakery': ['Product showcase', 'Order form', 'Instagram feed'],
  'furn-showroom': ['Collection pages', 'Room sets', 'Specs table'],
  'furn-minimal': ['Clean grid', 'Lookbook', 'Wishlist'],
  'furn-luxe': ['Hero carousel', 'Featured sets', 'Contact'],
};

// 根據 ID 推回 category（因為 DB 裡沒有 category 欄位）
function inferCategoryFromId(id = '') {
  if (id.startsWith('fashion-')) return 'fashion';
  if (id.startsWith('electronics-')) return 'electronics';
  if (id.startsWith('blog-')) return 'blog';
  if (id.startsWith('gov-')) return 'government';
  if (id.startsWith('food-')) return 'food-store';
  if (id.startsWith('furn-')) return 'furniture-store';
  return 'other';
}

function CategoryTemplates() {
  const { category } = useParams(); // 'fashion' / 'electronics' / 'blog' / 'government' / 'food-store' / 'furniture-store'
  const navigate = useNavigate();

  const INVENTORY_BASE =
    'https://ybfzpctey6.execute-api.us-east-2.amazonaws.com/dev/inventory-management';

  const [allItems, setAllItems] = useState([]);   // 從 inventory API 抓回來的所有模板 rows
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  // 一進來就抓 inventory（裡面放的就是模板）
  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${INVENTORY_BASE}/inventory`);
        const text = await res.text();
        console.log('INVENTORY RAW:', res.status, text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Inventory JSON parse error:', e, text);
          setError('Failed to load templates from server.');
          return;
        }

        // 兼容兩種格式：{items:[...]} 或 {statusCode, body:'{"items":[...]}'}
        let itemsPayload = Array.isArray(data.items) ? data.items : undefined;
        if (!itemsPayload && data.body) {
          try {
            const inner =
              typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            if (Array.isArray(inner.items)) {
              itemsPayload = inner.items;
            }
          } catch (e) {
            console.error('Inventory inner body parse error:', e, data.body);
          }
        }

        if (!itemsPayload) {
          console.error('Inventory items not found in response:', data);
          setError('Failed to load templates from server.');
          return;
        }

        // ⚠️ 注意：INVENTORY 表欄位是 ID / NAME / DESCRIPTION / PRICE / AVAILABLE_QTY
        // Lambda 很可能已經轉成小寫：id / name / description / price / availableQty
        // ⚠️ 注意：INVENTORY 表欄位是 ID / NAME / DESCRIPTION / PRICE / AVAILABLE_QTY
        // Lambda 很可能已經轉成小寫：id / name / description / price / availableQty
        const normalized = itemsPayload.map((it) => {
          // 先處理後端可能回來的不同大小寫欄位
          const rawId = it.id != null ? it.id : it.ID;
          const rawName = it.name != null ? it.name : it.NAME;
          const rawPrice = it.price != null ? it.price : it.PRICE;
          const rawQty =
            it.qty != null
              ? it.qty
              : it.availableQty != null
              ? it.availableQty
              : it.AVAILABLE_QTY != null
              ? it.AVAILABLE_QTY
              : 0;

          const idStr = String(rawId || '');

          return {
            id: rawId,
            name: rawName,
            // 這裡不從後端拿 category，直接用 ID 推回 category
            category: inferCategoryFromId(idStr),
            price: Number(rawPrice || 0),
            qty: rawQty,
          };
        });

        setAllItems(normalized);

      } catch (err) {
        console.error('Fetch inventory error:', err);
        setError('Failed to load templates from server.');
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  // 根據 route param 過濾對應 category 的模板
  const list = allItems.filter(
    (it) => String(it.category) === String(category)
  );

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
    const existingIndex = cart.findIndex((c) => c.id === item.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({
        id: item.id,
        name: `${item.name} (${category})`,
        price: item.price,
        image: IMAGE_MAP[item.id] || null,
        quantity: 1,
        type: 'template',
      });
    }
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    const subtotal = cart.reduce(
      (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
      0
    );
    localStorage.setItem('totalAmount', String(subtotal));
    navigate('/cart', { state: { cart } });
  };

  const resolveImage = (item) => {
    return IMAGE_MAP[item.id] || '/images/templates/placeholder.png';
  };

  const resolveFeatures = (item) => {
    return FEATURES_MAP[item.id] || ['Template feature 1', 'Template feature 2'];
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
        <h1 style={{ textTransform: 'capitalize' }}>{category} Templates</h1>
        <p>Loading templates...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ textTransform: 'capitalize' }}>{category} Templates</h1>

      {error && (
        <p style={{ color: 'crimson' }}>
          {error}
        </p>
      )}

      {list.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No templates found for this category.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {list.map(item => {
            const img = resolveImage(item);
            const features = resolveFeatures(item);
            return (
              <div key={item.id} style={{ border: '1px solid #e9ecef', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ height: 160, background: `url(${img}) center/cover, #dee2e6` }} />
                <div style={{ padding: 12 }}>
                  <h3 style={{ margin: '0 0 6px 0' }}>{item.name}</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#495057' }}>
                    {features.map((f, i) => (<li key={i}>{f}</li>))}
                  </ul>
                  <div style={{ marginTop: 8, fontWeight: 600 }}>${item.price}</div>
                  <div style={{ marginTop: 10 }}>
                    <button
                      style={{ background: '#6f42c1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}
                      onClick={() =>
                        setPreviewItem({ ...item, img, features })
                      }
                    >
                      Preview
                    </button>
                    <button
                      style={{ marginLeft: 8, background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ marginTop: 16, color: '#6c757d' }}>
        Replace images by adding files under `/public/images/templates/` with the same names.
      </p>
      <div style={{ marginTop: 12 }}>
        <Link to="/templates">← Back to Categories</Link>
      </div>

      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{ width: 'min(90vw, 900px)', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: 16, padding: 16 }}>
              <div style={{ flex: 2, background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
                <img src={previewItem.img} alt={previewItem.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0 }}>{previewItem.name}</h3>
                <div style={{ margin: '8px 0', fontWeight: 600 }}>${previewItem.price}</div>
                <p style={{ color: '#555' }}>Features:</p>
                <ul style={{ paddingLeft: 18, margin: '8px 0', color: '#555' }}>
                  {previewItem.features.map((f, i) => (<li key={i}>{f}</li>))}
                </ul>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button style={{ padding: '8px 12px' }} onClick={() => addToCart(previewItem)}>Add to Cart</button>
                  <button style={{ padding: '8px 12px' }} onClick={() => setPreviewItem(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryTemplates;


