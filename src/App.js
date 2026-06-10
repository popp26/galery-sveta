import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import './App.css';

// ─── helpers ──────────────────────────────────────────────────────
function fmt(p) { return Number(p).toLocaleString('ru-RU') + ' ₽'; }

// ─── Header ───────────────────────────────────────────────────────
function Header({ cartCount, wishCount, onCart, onAuth, user, onLogout }) {
  const [search, setSearch] = useState('');
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon">💡</div>
          <div className="logo-text">Галерея <span>Света</span></div>
        </div>
        <nav className="nav">
          <a href="#catalog">Каталог</a>
          <a href="#about">О нас</a>
          <a href="#delivery">Доставка</a>
          <a href="#contacts">Контакты</a>
        </nav>
        <div className="header-actions">
          <div className="search-box">
            <span>🔍</span>
            <input placeholder="Поиск люстр..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-icon" title="Избранное">
            🤍<span className="badge">{wishCount}</span>
          </button>
          <button className="btn-icon" onClick={onCart}>
            🛒<span className="badge">{cartCount}</span>
          </button>
          {user
            ? <div className="user-chip" onClick={onLogout} title="Выйти">👤 {user.name?.split(' ')[0]}</div>
            : <button className="btn-login" onClick={onAuth}>Войти</button>
          }
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────
function Hero({ onCatalog }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-badge">✦ Коллекция 2025–2026</div>
        <h1>Свет, который<br /><span>создаёт уют</span></h1>
        <p>Люстры и светильники премиум-класса для вашего дома. Более 1 200 моделей в наличии — от классики до модерна.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={onCatalog}>Смотреть каталог →</button>
          <button className="btn-secondary">Подобрать по интерьеру</button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="stat-num">1 200+</div><div className="stat-label">моделей</div></div>
          <div className="hero-stat"><div className="stat-num">15</div><div className="stat-label">лет на рынке</div></div>
          <div className="hero-stat"><div className="stat-num">4.9</div><div className="stat-label">рейтинг</div></div>
          <div className="hero-stat"><div className="stat-num">20+</div><div className="stat-label">брендов</div></div>
        </div>
      </div>
    </section>
  );
}

// ─── ProductCard ───────────────────────────────────────────────────
function ProductCard({ p, onOpen, onCart, onWish, inWish, inCart }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="product-card" onClick={() => onOpen(p)}>
      <div className="product-img">
        {!imgErr && p.image_url
          ? <img src={p.image_url} alt={p.name} onError={() => setImgErr(true)} />
          : <div className="img-placeholder">💡</div>
        }
        {p.badge && (
          <span className={`product-badge badge-${p.badge}`}>
            {p.badge === 'hit' ? 'Хит' : p.badge === 'new' ? 'Новинка' : 'Скидка'}
          </span>
        )}
        <button className={`product-wish${inWish ? ' active' : ''}`}
          onClick={e => { e.stopPropagation(); onWish(p.id); }}>
          {inWish ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="product-body">
        <div className="product-cat">{p.style}</div>
        <div className="product-name">{p.name}</div>
        <div className="product-meta">
          <span>💡 {p.lamp_count} ламп</span>
          <span>🔧 {p.material}</span>
          <span>⭐ {p.rating} ({p.review_count})</span>
        </div>
        <div className="product-footer">
          <div>
            <span className="product-price">{fmt(p.price)}</span>
            {p.old_price && <span className="product-price-old">{fmt(p.old_price)}</span>}
          </div>
          <button className={`btn-cart${inCart ? ' added' : ''}`}
            onClick={e => { e.stopPropagation(); onCart(p); }}>
            {inCart ? '✓' : '+ В корзину'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────
function ProductModal({ p, onClose, onCart, inCart }) {
  const [imgErr, setImgErr] = useState(false);
  if (!p) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-inner">
          <div className="modal-img">
            {!imgErr && p.image_url
              ? <img src={p.image_url} alt={p.name} onError={() => setImgErr(true)} />
              : <div className="img-placeholder big">💡</div>
            }
          </div>
          <div className="modal-info">
            <span className="modal-badge">{p.style}</span>
            <h2 className="modal-title">{p.name}</h2>
            <div className="modal-price">{fmt(p.price)}</div>
            <div className="modal-specs">
              <div className="spec"><div className="spec-label">Ламп</div><div className="spec-val">{p.lamp_count} шт.</div></div>
              <div className="spec"><div className="spec-label">Материал</div><div className="spec-val">{p.material}</div></div>
              <div className="spec"><div className="spec-label">Рейтинг</div><div className="spec-val">⭐ {p.rating} ({p.review_count})</div></div>
              <div className="spec"><div className="spec-label">Стиль</div><div className="spec-val">{p.style}</div></div>
            </div>
            <p className="modal-desc">{p.description}</p>
            <div className="modal-actions">
              <button className={`btn-modal-cart${inCart ? ' added' : ''}`} onClick={() => onCart(p)}>
                {inCart ? '✓ В корзине' : 'Добавить в корзину'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cart ──────────────────────────────────────────────────────────
function CartDrawer({ items, onClose, onQty, onRemove, onCheckout }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = total >= 50000 ? 0 : 890;
  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <div className="cart-title">Корзина <span>({items.length})</span></div>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>
        <div className="cart-items">
          {items.length === 0
            ? <div className="cart-empty"><div>🛒</div><p>Корзина пуста</p></div>
            : items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} onError={e => e.target.style.display = 'none'} />
                    : '💡'}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{fmt(item.price)}</div>
                  <div className="cart-item-qty">
                    <button onClick={() => onQty(item.id, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => onQty(item.id, 1)}>+</button>
                  </div>
                </div>
                <span className="cart-item-remove" onClick={() => onRemove(item.id)}>🗑</span>
              </div>
            ))
          }
        </div>
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-row"><span>Товары</span><span>{fmt(total)}</span></div>
            <div className="cart-row"><span>Доставка</span>
              <span style={{ color: delivery === 0 ? '#4A9B6F' : undefined }}>
                {delivery === 0 ? 'Бесплатно' : fmt(delivery)}
              </span>
            </div>
            {delivery > 0 && <div className="cart-hint">Бесплатно от 50 000 ₽</div>}
            <div className="cart-total">{fmt(total + delivery)}</div>
            <button className="btn-checkout" onClick={onCheckout}>Оформить заказ →</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Auth Modal ─────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(''); setLoading(true);
    try {
      const data = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      localStorage.setItem('token', data.token);
      onSuccess(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="auth-title">{mode === 'login' ? 'Добро пожаловать' : 'Регистрация'}</h2>
        <p className="auth-sub">{mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте аккаунт бесплатно'}</p>
        {mode === 'reg' && (
          <div className="auth-field">
            <label>Имя</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" />
          </div>
        )}
        <div className="auth-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="example@mail.ru" />
        </div>
        <div className="auth-field">
          <label>Пароль</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button className="btn-auth" onClick={submit} disabled={loading}>
          {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
        <div className="auth-switch">
          {mode === 'login'
            ? <>Нет аккаунта? <button onClick={() => setMode('reg')}>Зарегистрироваться</button></>
            : <>Уже есть аккаунт? <button onClick={() => setMode('login')}>Войти</button></>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Toast ──────────────────────────────────────────────────────────
function Toast({ msg, show }) {
  return <div className={`toast${show ? '' : ' hidden'}`}><span>✓</span>{msg}</div>;
}

// ─── App ────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', style: '', material: '', price_min: '', price_max: '', sort: 'popular' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('wishlist') || '[]'));
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // Persist cart/wishlist
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  // Load user from token
  useEffect(() => {
    if (localStorage.getItem('token')) {
      api.getMe().then(setUser).catch(() => localStorage.removeItem('token'));
    }
  }, []);

  // Load categories
  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Load products
  useEffect(() => {
    setLoading(true);
    const params = { ...filters, page, limit: 12 };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    api.getProducts(params)
      .then(data => { setProducts(data.products); setTotalPages(data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, page]);

  function showToast(msg) {
    setToast({ show: true, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }

  function addToCart(p) {
    setCart(c => {
      const ex = c.find(i => i.id === p.id);
      if (ex) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...p, qty: 1 }];
    });
    showToast(`${p.name} добавлена в корзину`);
  }

  function toggleWish(id) {
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  }

  function handleCheckout() {
    if (!user) { setCartOpen(false); setAuthOpen(true); return; }
    api.createOrder({
      items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
      name: user.name, phone: user.phone || '', address: ''
    }).then(() => {
      setCart([]);
      setCartOpen(false);
      showToast('Заказ оформлен! Мы свяжемся с вами.');
    }).catch(e => showToast('Ошибка: ' + e.message));
  }

  const STYLES = ['Все стили', 'Классика', 'Модерн', 'Люкс', 'Минимализм', 'Арт-деко', 'Современный'];
  const MATERIALS = ['Все материалы', 'Хрусталь', 'Хрусталь К9', 'Стекло', 'Металл'];

  return (
    <>
      <Header
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        wishCount={wishlist.length}
        onCart={() => setCartOpen(true)}
        onAuth={() => setAuthOpen(true)}
        user={user}
        onLogout={() => { setUser(null); localStorage.removeItem('token'); }}
      />

      <Hero onCatalog={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} />

      {/* Categories */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Категории <span>товаров</span></h2>
        </div>
        <div className="cats">
          <div className={`cat${!filters.category ? ' active' : ''}`} onClick={() => { setFilters(f => ({ ...f, category: '' })); setPage(1); }}>
            <div className="cat-icon">✨</div>
            <div className="cat-name">Все</div>
          </div>
          {categories.map(c => (
            <div key={c.id} className={`cat${filters.category === c.slug ? ' active' : ''}`}
              onClick={() => { setFilters(f => ({ ...f, category: c.slug })); setPage(1); }}>
              <div className="cat-icon">{c.icon}</div>
              <div className="cat-name">{c.name}</div>
              <div className="cat-count">{c.product_count} товаров</div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog */}
      <div className="section" id="catalog" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Каталог <span>люстр</span></h2>
            <div className="section-sub">{loading ? 'Загрузка...' : `Найдено: ${products.length} товаров`}</div>
          </div>
          <select className="filter-select" value={filters.sort}
            onChange={e => { setFilters(f => ({ ...f, sort: e.target.value })); setPage(1); }}>
            <option value="popular">По популярности</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
            <option value="newest">По новизне</option>
            <option value="rating">По рейтингу</option>
          </select>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <div className="filter-label">Стиль</div>
            <select className="filter-select" value={filters.style}
              onChange={e => { setFilters(f => ({ ...f, style: e.target.value === 'Все стили' ? '' : e.target.value })); setPage(1); }}>
              {STYLES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <div className="filter-label">Материал</div>
            <select className="filter-select" value={filters.material}
              onChange={e => { setFilters(f => ({ ...f, material: e.target.value === 'Все материалы' ? '' : e.target.value })); setPage(1); }}>
              {MATERIALS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <div className="filter-label">Цена (₽)</div>
            <div className="price-inputs">
              <input className="price-input" placeholder="от" value={filters.price_min}
                onChange={e => { setFilters(f => ({ ...f, price_min: e.target.value })); setPage(1); }} />
              <span>—</span>
              <input className="price-input" placeholder="до" value={filters.price_max}
                onChange={e => { setFilters(f => ({ ...f, price_max: e.target.value })); setPage(1); }} />
            </div>
          </div>
          <button className="btn-reset" onClick={() => { setFilters({ category: '', style: '', material: '', price_min: '', price_max: '', sort: 'popular' }); setPage(1); }}>
            Сбросить
          </button>
        </div>

        {loading
          ? <div className="loading">⏳ Загружаем товары...</div>
          : <div className="products-grid">
            {products.map(p => (
              <ProductCard key={p.id} p={p}
                onOpen={setModal} onCart={addToCart} onWish={toggleWish}
                inWish={wishlist.includes(p.id)} inCart={cart.some(i => i.id === p.id)}
              />
            ))}
            {products.length === 0 && (
              <div className="empty">
                <div>🔍</div>
                <p>Ничего не найдено. Попробуйте изменить фильтры.</p>
              </div>
            )}
          </div>
        }

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`page-btn${n === page ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
          </div>
        )}
      </div>

      <footer className="footer" id="contacts">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="logo"><div className="logo-icon">💡</div><div className="logo-text footer-logo">Галерея <span>Света</span></div></div>
              <p className="footer-desc">Люстры и светильники премиум-класса. Более 15 лет в Ставрополе.</p>
              <a href="tel:+78652230022" className="footer-contact">+7 (8652) 23-00-22</a>
              <a href="mailto:galerysveta@mail.ru" className="footer-contact">galerysveta@mail.ru</a>
            </div>
            <div>
              <div className="footer-col-title">Каталог</div>
              {['Люстры', 'Потолочные', 'Настенные', 'Подвесные', 'Торшеры'].map(l => (
                <a key={l} className="footer-link">{l}</a>
              ))}
            </div>
            <div>
              <div className="footer-col-title">Покупателям</div>
              {['Доставка и оплата', 'Гарантия', 'Возврат', 'FAQ'].map(l => (
                <a key={l} className="footer-link">{l}</a>
              ))}
            </div>
            <div>
              <div className="footer-col-title">Компания</div>
              {['О нас', 'Новости', 'Контакты', 'Политика'].map(l => (
                <a key={l} className="footer-link">{l}</a>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Галерея Света. ИП Ларионов С.Б.</span>
            <span>г. Ставрополь, ул. Космонавтов, 2</span>
          </div>
        </div>
      </footer>

      {modal && <ProductModal p={modal} onClose={() => setModal(null)} onCart={addToCart} inCart={cart.some(i => i.id === modal.id)} />}
      {cartOpen && <CartDrawer items={cart} onClose={() => setCartOpen(false)}
        onQty={(id, d) => setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i))}
        onRemove={id => setCart(c => c.filter(i => i.id !== id))}
        onCheckout={handleCheckout} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={u => { setUser(u); setAuthOpen(false); showToast(`Добро пожаловать, ${u.name}!`); }} />}
      <Toast msg={toast.msg} show={toast.show} />
    </>
  );
}
