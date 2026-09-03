const CATALOG = {
  mogiana: {
    id: 'mogiana',
    title: 'Кофе в зернах Бразилия Моджиана',
    type: 'coffee',
    img: 'assets/mogiana.png',
    weights: [{ id: '1000', label: '1000 гр' }],
    grinds: [
      { id: 'beans', label: 'В зернах', price: 1500 },
      { id: 'ground', label: 'Молотый', price: 1580 }
    ]
  },
  mogianaSale: {
    id: 'mogianaSale',
    title: 'Кофе в зернах Бразилия Моджиана, 1 кг',
    type: 'coffee',
    img: 'assets/mogiana.png',
    discount: 0.15,
    weights: [{ id: '1000', label: '1000 гр' }],
    grinds: [
      { id: 'beans', label: 'В зернах', price: 1500 },
      { id: 'ground', label: 'Молотый', price: 1580 }
    ]
  },
  guji: {
    id: 'guji',
    title: 'Кофе в зернах Эфиопия Гуджи',
    type: 'coffee',
    img: 'assets/cerrado.png',
    discount: 0.15,
    weights: [
      { id: '200', label: '200 гр', factor: 1 },
      { id: '1000', label: '1000 гр', factor: 4.2 }
    ],
    grinds: [
      { id: 'beans', label: 'В зернах', price: 1500 },
      { id: 'ground', label: 'Молотый', price: 1550 }
    ]
  },
  cerrado: {
    id: 'cerrado',
    title: 'Кофе в зернах Бразилия Серрадо, 1 кг',
    type: 'coffee',
    img: 'assets/cerrado.png',
    weights: [{ id: '1000', label: '1000 гр' }],
    grinds: [
      { id: 'beans', label: 'В зернах', price: 1450 },
      { id: 'ground', label: 'Молотый', price: 1520 }
    ]
  },
  blend: {
    id: 'blend',
    title: 'Кофе в зернах Бленд CofeFest, 200 г',
    type: 'coffee',
    img: 'assets/blend.png',
    weights: [{ id: '200', label: '200 гр' }],
    grinds: [
      { id: 'beans', label: 'В зернах', price: 550 },
      { id: 'ground', label: 'Молотый', price: 580 }
    ]
  },
  cake: {
    id: 'cake',
    title: 'Торт на заказ «Наполеон»',
    type: 'confectionery',
    img: '',
    cake: true,
    weights: [{ id: '1', label: '1 шт' }],
    grinds: [{ id: 'default', label: 'Стандарт', price: 3200 }]
  }
};

const UPSELL = ['blend', 'cerrado', 'cake', 'guji', 'mogiana'];
const POINTS = [
  { id: 'tverskaya', name: 'Кофейня на Тверской', address: 'Москва, ул. Тверская, 12', x: 48, y: 42 },
  { id: 'arbat', name: 'Кофейня на Арбате', address: 'Москва, ул. Арбат, 21', x: 40, y: 50 },
  { id: 'sokol', name: 'Кофейня Сокол', address: 'Москва, Ленинградский пр-т, 75', x: 36, y: 28 },
  { id: 'taganka', name: 'Кондитерская на Таганке', address: 'Москва, ул. Таганская, 3', x: 62, y: 55, confectionery: true }
];

const PROMOS = {
  COFE10: { type: 'percent', value: 10, label: 'Скидка 10% на заказ' },
  BLACKFRIDAY: { type: 'percent', value: 15, label: 'Многоразовый промокод −15%' },
  FREESHIP: { type: 'freeship', label: 'Бесплатная доставка' },
  GIFT5000: { type: 'gift', min: 5000, label: 'Подарок при заказе от 5000 ₽' }
};

const DEFAULT_CART = [
  { uid: 'c1', productId: 'mogiana', grind: 'beans', weight: '1000', qty: 1 },
  { uid: 'c2', productId: 'mogianaSale', grind: 'beans', weight: '1000', qty: 1 },
  { uid: 'c3', productId: 'guji', grind: 'beans', weight: '200', qty: 1 },
  { uid: 'c4', productId: 'cerrado', grind: 'beans', weight: '1000', qty: 1 },
  { uid: 'c5', productId: 'blend', grind: 'beans', weight: '200', qty: 1 }
];

function loadState() {
  try {
    const raw = localStorage.getItem('cofefest-cart');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    items: JSON.parse(JSON.stringify(DEFAULT_CART)),
    promo: '',
    delivery: '',
    payment: '',
    point: '',
    date: '',
    address: '',
    files: []
  };
}

let state = loadState();
let expanded = false;
let carouselIndex = 0;

function save() {
  localStorage.setItem('cofefest-cart', JSON.stringify(state));
}

function money(n) {
  return `${Math.round(n).toLocaleString('ru-RU')} ₽`;
}

function unitPrice(item) {
  const p = CATALOG[item.productId];
  const grind = p.grinds.find((g) => g.id === item.grind) || p.grinds[0];
  const weight = p.weights.find((w) => w.id === item.weight) || p.weights[0];
  const factor = weight.factor || 1;
  const base = grind.price * factor;
  const sale = p.discount ? base * (1 - p.discount) : base;
  return { base, sale, hasDiscount: !!p.discount };
}

function lineTotal(item) {
  const { sale } = unitPrice(item);
  return sale * item.qty;
}

function cartFlags() {
  const hasCoffee = state.items.some((i) => CATALOG[i.productId].type === 'coffee');
  const hasCake = state.items.some((i) => CATALOG[i.productId].type === 'confectionery');
  return { hasCoffee, hasCake, hasItems: state.items.length > 0 };
}

function nearestDate(offset = 1) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return formatDate(d);
}

function formatDate(d) {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
}

function dateOptions() {
  const list = [];
  for (let i = 1; i <= 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    list.push({ value: formatDate(d), label: formatDate(d) });
  }
  return list;
}

function deliveryCost() {
  if (!state.delivery) return 0;
  if (state.promo && PROMOS[state.promo.toUpperCase()]?.type === 'freeship') return 0;
  if (state.delivery === 'cafe' || state.delivery === 'confectionery') return 0;
  if (state.delivery === 'yandex') return state.address.trim().length >= 8 ? 390 : 0;
  if (state.delivery === 'post5') return state.address.trim().length >= 8 ? 249 : 0;
  return 0;
}

function totals() {
  const goods = state.items.reduce((s, i) => s + unitPrice(i).base * i.qty, 0);
  let productDiscount = state.items.reduce((s, i) => {
    const u = unitPrice(i);
    return s + (u.base - u.sale) * i.qty;
  }, 0);
  const promo = PROMOS[state.promo.toUpperCase()];
  let promoDiscount = 0;
  let gift = '';
  const afterItem = goods - productDiscount;
  if (promo?.type === 'percent') promoDiscount = afterItem * (promo.value / 100);
  if (promo?.type === 'gift' && afterItem >= promo.min) gift = 'Подарок будет добавлен менеджером';
  const ship = deliveryCost();
  const pay = Math.max(0, afterItem - promoDiscount + ship);
  return { goods, discount: productDiscount + promoDiscount, ship, pay, gift, promo };
}

function deliveryMethods() {
  const { hasCake } = cartFlags();
  const list = [
    { id: 'cafe', label: 'Забрать в кофейне' },
    { id: 'confectionery', label: 'Кондитерская' },
    { id: 'yandex', label: 'Яндекс Еда' }
  ];
  if (!hasCake) list.push({ id: 'post5', label: '5 POST' });
  return list;
}

function paymentLabel() {
  if (state.payment === 'online_now') return 'Онлайн сразу';
  if (state.payment === 'online_after') return 'Онлайн после подтверждения';
  return '—';
}

function deliveryLabel() {
  return deliveryMethods().find((m) => m.id === state.delivery)?.label || '—';
}

function deliveryAddress() {
  if (state.delivery === 'cafe' || state.delivery === 'confectionery') {
    const point = POINTS.find((p) => p.id === state.point);
    return point ? point.address : 'Выберите точку';
  }
  if (state.delivery === 'yandex' || state.delivery === 'post5') {
    return state.address.trim() || 'Укажите адрес';
  }
  return '—';
}

function updateBadge() {
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = state.items.reduce((s, i) => s + i.qty, 0);
  });
}

function renderItems() {
  const root = document.getElementById('items');
  if (!root) return;
  const visible = expanded ? state.items : state.items.slice(0, 3);
  root.innerHTML = visible.map((item) => {
    const p = CATALOG[item.productId];
    const u = unitPrice(item);
    const grindOpts = p.grinds.map((g) => `<option value="${g.id}" ${g.id === item.grind ? 'selected' : ''}>${g.label}</option>`).join('');
    const weightOpts = p.weights.map((w) => `<option value="${w.id}" ${w.id === item.weight ? 'selected' : ''}>${w.label}</option>`).join('');
    const img = p.img
      ? `<img src="${p.img}" alt="">`
      : `<div class="cake-art">🎂</div>`;
    const badge = p.discount ? `<div class="sale-badge">${Math.round(p.discount * 100)}%</div>` : '';
    return `
      <article class="item" data-uid="${item.uid}">
        <div class="thumb">${badge}${img}</div>
        <div>
          <p class="item-title">${p.title}${p.weights.length === 1 && p.weights[0].id === '1000' && !p.title.includes('кг') ? ', 1 кг' : ''}</p>
          <div class="item-controls">
            ${p.type === 'coffee' && p.grinds.length > 1 ? `<select class="opt-select" data-act="grind" aria-label="Помол">${grindOpts}</select>` : ''}
            ${p.weights.length > 1 ? `<select class="opt-select" data-act="weight" aria-label="Вес">${weightOpts}</select>` : ''}
            <div class="qty">
              Количество
              <button type="button" data-act="minus">−</button>
              <input data-act="qty" value="${item.qty}">
              <button type="button" data-act="plus">+</button>
            </div>
          </div>
        </div>
        <div class="price-col">
          ${u.hasDiscount ? `<span class="old">${money(u.base)}</span>` : ''}
          <div class="price">${money(u.sale)}</div>
        </div>
        <button class="icon-btn" data-act="remove" title="Удалить">🗑</button>
      </article>`;
  }).join('');

  const more = document.getElementById('showMore');
  if (state.items.length > 3 && !expanded) {
    more.classList.remove('hidden');
  } else {
    more.classList.add('hidden');
  }
}

function renderDelivery() {
  const methods = document.getElementById('deliveryMethods');
  if (!methods) return;
  const allowed = deliveryMethods();
  if (state.delivery && !allowed.some((m) => m.id === state.delivery)) state.delivery = '';
  methods.innerHTML = allowed.map((m) => `
    <label class="method">
      <input type="radio" name="delivery" value="${m.id}" ${state.delivery === m.id ? 'checked' : ''}>
      ${m.label}
    </label>`).join('');

  const extra = document.getElementById('deliveryExtra');
  const { hasCake } = cartFlags();
  extra.innerHTML = '';

  if (!state.date) state.date = nearestDate();

  if (state.delivery === 'cafe' || state.delivery === 'confectionery') {
    const wantCakePoint = state.delivery === 'confectionery';
    const pins = POINTS.filter((p) => wantCakePoint ? p.confectionery : !p.confectionery);
    const selected = POINTS.find((p) => p.id === state.point) || pins[0];
    if (!pins.some((p) => p.id === state.point)) state.point = selected.id;
    const mapSrc = state.delivery === 'confectionery' ? 'assets/map-cdek.png' : 'assets/map-cofe.png';
    extra.innerHTML = `
      <div class="subbox">
        <div class="row"><span>Адрес точки</span><span class="dots"></span><strong>${selected.address}</strong></div>
        <div class="row"><span>Ближайшая дата</span><span class="dots"></span>
          <button type="button" class="date-btn" id="changeDate">📅 ${state.date}</button>
        </div>
        <p class="hint">Дату можно сменить вручную или через календарь.</p>
        <div class="map-wrap">
          <img src="${mapSrc}" alt="Карта точек">
          ${pins.map((p) => `
            <button class="pin ${p.id === state.point ? 'active' : ''}" style="left:${p.x}%;top:${p.y}%" data-point="${p.id}">
              <span></span><i class="pin-label">${p.name}</i>
            </button>`).join('')}
        </div>
      </div>`;
  }

  if (state.delivery === 'yandex' || state.delivery === 'post5') {
    const cost = deliveryCost();
    const map = state.delivery === 'post5'
      ? '<div class="map-wrap"><img src="assets/map-5post.png" alt="Пункты 5 POST"></div>'
      : '';
    extra.innerHTML = `
      <div class="subbox">
        <div class="field"><input id="shipAddress" placeholder="Адрес доставки" value="${state.address}"></div>
        <p class="hint">Стоимость доставки: <strong>${state.address.trim().length >= 8 ? money(cost) : 'укажите адрес для расчёта'}</strong></p>
        ${map}
      </div>`;
  }

  const attach = document.getElementById('attachBlock');
  if (attach) attach.classList.toggle('hidden', !hasCake);
}

function renderContactHints() {
  const hint = document.getElementById('nearestHint');
  if (!hint) return;
  const { hasCoffee } = cartFlags();
  if (hasCoffee) {
    if (!state.date) state.date = nearestDate();
    hint.textContent = 'Ближайшая дата для кофе: ' + state.date + '. Точную дату можно выбрать после способа доставки.';
  } else {
    hint.textContent = '';
  }
}

function renderSidebar() {
  const box = document.getElementById('sidebar');
  if (!box) return;
  const agreed = document.getElementById('agree')?.checked;
  const t = totals();
  const addr = deliveryAddress();
  box.innerHTML = `
    <div class="row"><span>Заказ</span><span class="dots"></span><span>${money(t.goods)}</span></div>
    <div class="row green"><span>Скидка</span><span class="dots"></span><span>${money(t.discount)}</span></div>
    <div class="row"><span>Стоимость доставки</span><span class="dots"></span><span>${money(t.ship)}</span></div>
    <div class="row"><span>Способ оплаты</span><span class="dots"></span><span>${paymentLabel()}</span></div>
    <div class="row"><span>Способ доставки</span><span class="dots"></span><span>${deliveryLabel()}</span></div>
    <div class="row"><span>Адрес доставки</span><span class="dots"></span>
      <a href="#deliveryBlock">${addr}</a>
    </div>
    <div class="promo">
      <input id="promoInput" placeholder="Промокод" value="${state.promo}">
    </div>
    <div class="promo-msg" id="promoMsg">${t.promo ? (t.promo.label + (t.gift ? '. ' + t.gift : '')) : (state.promo ? 'Промокод не найден или не подходит' : '')}</div>
    <div class="total"><span>Итого к оплате</span><span>${money(t.pay)}</span></div>
    <label class="agree">
      <input type="checkbox" id="agree" ${agreed ? 'checked' : ''}>
      <span>Согласен с условиями обработки данных, пользовательского соглашения и оферты</span>
    </label>
    <button class="cta" id="submitOrder" ${agreed ? '' : 'disabled'}>Оформить заказ</button>
    <img class="pay-logos" src="assets/pay-logos.png" alt="МИР, СБП, Visa, Mastercard">
  `;
}

function renderAll() {
  if (!state.items.length && location.pathname.endsWith('cart.html')) {
    location.href = 'index.html?empty=1';
    return;
  }
  save();
  updateBadge();
  renderItems();
  renderContactHints();
  renderDelivery();
  renderSidebar();
  document.querySelectorAll('input[name="payment"]').forEach((el) => {
    el.checked = el.value === state.payment;
  });
}

function addItem(productId) {
  const p = CATALOG[productId];
  const existing = state.items.find((i) => i.productId === productId);
  if (existing) existing.qty += 1;
  else {
    state.items.push({
      uid: 'c' + Date.now(),
      productId,
      grind: p.grinds[0].id,
      weight: p.weights[0].id,
      qty: 1
    });
  }
  renderAll();
}

function updateItemPrice(itemEl, item) {
  const col = itemEl.querySelector('.price-col');
  if (!col) return;
  const u = unitPrice(item);
  col.innerHTML = `
    ${u.hasDiscount ? `<span class="old">${money(u.base)}</span>` : ''}
    <div class="price">${money(u.sale)}</div>`;
}

function bindCart() {
  document.getElementById('items').addEventListener('click', (e) => {
    const actEl = e.target.closest('[data-act]');
    if (!actEl) return;
    const act = actEl.dataset.act;
    if (act !== 'minus' && act !== 'plus' && act !== 'remove') return;
    const itemEl = e.target.closest('.item');
    if (!itemEl) return;
    const item = state.items.find((i) => i.uid === itemEl.dataset.uid);
    if (!item) return;
    if (act === 'minus') item.qty = Math.max(1, item.qty - 1);
    if (act === 'plus') item.qty += 1;
    if (act === 'remove') state.items = state.items.filter((i) => i.uid !== item.uid);
    renderAll();
  });
  document.getElementById('items').addEventListener('change', (e) => {
    const itemEl = e.target.closest('.item');
    if (!itemEl) return;
    const item = state.items.find((i) => i.uid === itemEl.dataset.uid);
    if (!item) return;
    const act = e.target.dataset.act;
    if (act === 'grind') item.grind = e.target.value;
    if (act === 'weight') item.weight = e.target.value;
    if (act === 'qty') item.qty = Math.max(1, parseInt(e.target.value, 10) || 1);
    if (act === 'grind' || act === 'weight') {
      save();
      updateItemPrice(itemEl, item);
      renderSidebar();
      return;
    }
    renderAll();
  });
  document.getElementById('showMore').addEventListener('click', () => {
    expanded = true;
    renderAll();
  });
  document.getElementById('clearCart').addEventListener('click', () => {
    if (confirm('Очистить корзину?')) {
      state.items = [];
      save();
      location.href = 'index.html?empty=1';
    }
  });
  document.getElementById('openUpsell').addEventListener('click', () => {
    document.getElementById('upsellModal').classList.add('open');
    renderCarousel();
  });
  document.getElementById('closeUpsell').addEventListener('click', () => {
    document.getElementById('upsellModal').classList.remove('open');
  });
  document.getElementById('upsellModal').addEventListener('click', (e) => {
    if (e.target.id === 'upsellModal') e.currentTarget.classList.remove('open');
  });
  document.getElementById('prevSlide').addEventListener('click', () => {
    carouselIndex = Math.max(0, carouselIndex - 1);
    renderCarousel();
  });
  document.getElementById('nextSlide').addEventListener('click', () => {
    carouselIndex = Math.min(UPSELL.length - 4, carouselIndex + 1);
    renderCarousel();
  });
  document.getElementById('carouselTrack').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    addItem(btn.dataset.add);
  });

  document.getElementById('deliveryMethods').addEventListener('change', (e) => {
    if (e.target.name === 'delivery') {
      state.delivery = e.target.value;
      if (!state.date) state.date = nearestDate();
      renderAll();
    }
  });
  document.getElementById('deliveryExtra').addEventListener('click', (e) => {
    const pin = e.target.closest('[data-point]');
    if (pin) {
      state.point = pin.dataset.point;
      renderAll();
    }
    if (e.target.id === 'changeDate' || e.target.closest('#changeDate')) {
      toggleCalendar(e.target.closest('#changeDate') || e.target);
    }
  });
  document.getElementById('deliveryExtra').addEventListener('input', (e) => {
    if (e.target.id === 'shipAddress') {
      state.address = e.target.value;
      renderAll();
      const input = document.getElementById('shipAddress');
      if (input) {
        input.focus();
        input.setSelectionRange(state.address.length, state.address.length);
      }
    }
  });

  document.querySelectorAll('input[name="payment"]').forEach((el) => {
    el.addEventListener('change', () => {
      state.payment = el.value;
      renderAll();
    });
  });

  document.getElementById('fileInput').addEventListener('change', (e) => {
    const files = [...e.target.files].filter((f) => /\.(png|jpe?g|pdf)$/i.test(f.name));
    state.files = files.map((f) => f.name);
    document.getElementById('fileList').textContent = state.files.length
      ? 'Файлы: ' + state.files.join(', ')
      : '';
    save();
  });

  document.getElementById('sidebar').addEventListener('input', (e) => {
    if (e.target.id === 'promoInput') {
      state.promo = e.target.value.trim();
      renderAll();
      const input = document.getElementById('promoInput');
      if (input) {
        input.focus();
        input.setSelectionRange(state.promo.length, state.promo.length);
      }
    }
  });
  document.getElementById('sidebar').addEventListener('change', (e) => {
    if (e.target.id === 'agree') {
      document.getElementById('submitOrder').disabled = !e.target.checked;
    }
  });
  document.getElementById('sidebar').addEventListener('click', (e) => {
    if (e.target.id === 'submitOrder') submitOrder();
  });

  document.getElementById('resetDemo')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('cofefest-cart');
    sessionStorage.removeItem('cofefest-order');
    location.href = 'cart.html';
  });
  document.getElementById('loggedToggle').addEventListener('change', (e) => {
    if (e.target.checked) {
      document.getElementById('name').value = 'Анна Иванова';
      document.getElementById('phone').value = '+7 916 000-00-00';
      document.getElementById('email').value = 'anna@mail.ru';
    }
  });
}

function toggleCalendar(anchor) {
  const old = document.querySelector('.cal');
  if (old) { old.remove(); return; }
  const cal = document.createElement('div');
  cal.className = 'cal';
  dateOptions().forEach((d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = d.label;
    if (d.value === state.date) b.classList.add('active');
    b.onclick = () => { state.date = d.value; cal.remove(); renderAll(); };
    cal.appendChild(b);
  });
  anchor.parentElement.style.position = 'relative';
  anchor.parentElement.appendChild(cal);
}

function renderCarousel() {
  const track = document.getElementById('carouselTrack');
  const slice = UPSELL.slice(carouselIndex, carouselIndex + 4);
  track.innerHTML = slice.map((id) => {
    const p = CATALOG[id];
    const price = p.grinds[0].price;
    const img = p.img ? `<img src="${p.img}" alt="">` : `<div class="cake-art" style="width:100%;height:140px">🎂</div>`;
    return `
      <article class="card">
        ${img}
        <div class="t">${p.title}</div>
        <div class="bottom">
          <strong>${money(price)}</strong>
          <button class="add-btn" data-add="${id}">В корзину 🛍</button>
        </div>
      </article>`;
  }).join('');
}

function submitOrder() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const err = document.getElementById('formError');
  if (!name || !phone || !email) {
    err.textContent = 'Заполните имя, телефон и e-mail';
    return;
  }
  if (!state.delivery) {
    err.textContent = 'Выберите способ доставки';
    document.getElementById('deliveryBlock').scrollIntoView();
    return;
  }
  if (!state.payment) {
    err.textContent = 'Выберите способ оплаты';
    return;
  }
  if ((state.delivery === 'yandex' || state.delivery === 'post5') && state.address.trim().length < 8) {
    err.textContent = 'Укажите адрес доставки';
    return;
  }
  if ((state.delivery === 'cafe' || state.delivery === 'confectionery') && !state.point) {
    err.textContent = 'Выберите точку на карте';
    return;
  }
  err.textContent = '';
  const order = {
    name, phone, email,
    wishes: document.getElementById('wishes').value.trim(),
    date: state.date,
    files: state.files,
    delivery: deliveryLabel(),
    address: deliveryAddress(),
    payment: paymentLabel(),
    totals: totals(),
    items: state.items
  };
  sessionStorage.setItem('cofefest-order', JSON.stringify(order));
  if (state.payment === 'online_now') location.href = 'pay.html';
  else location.href = 'success.html?mode=confirm';
}

function renderHome() {
  updateBadge();
  const q = new URLSearchParams(location.search);
  if (q.get('empty') === '1') {
    document.getElementById('emptyNote').classList.remove('hidden');
  }
}

function renderPay() {
  const order = JSON.parse(sessionStorage.getItem('cofefest-order') || 'null');
  if (!order) { location.href = 'cart.html'; return; }
  document.getElementById('paySum').textContent = money(order.totals.pay);
}

function renderSuccess() {
  const order = JSON.parse(sessionStorage.getItem('cofefest-order') || 'null');
  if (!order) { location.href = 'cart.html'; return; }
  const mode = new URLSearchParams(location.search).get('mode');
  document.getElementById('successTitle').textContent =
    mode === 'confirm' ? 'Заказ принят и ждёт подтверждения' : 'Оплата прошла успешно';
  document.getElementById('successText').textContent =
    mode === 'confirm'
      ? 'Мы свяжемся с вами и пришлём ссылку на оплату после подтверждения заказа.'
      : 'Спасибо! Чек отправлен на почту, заказ появится в личном кабинете.';
  document.getElementById('successDetails').innerHTML = `
    <p><strong>${order.name}</strong>, ${order.phone}<br>${order.email}</p>
    <p>${order.delivery}<br>${order.address}<br>${order.date || ''}</p>
    <p>К оплате: <strong>${money(order.totals.pay)}</strong></p>`;
  state.items = [];
  save();
}

window.CartApp = { renderAll, bindCart, renderHome, renderPay, renderSuccess, addItem };
