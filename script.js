
const PRODUCTS = [
  {id:'p1', name:'Óleo de Massagem Relax', price:49.9, category:'bem-estar', img:'assets/produto1.svg', meta:'Aromático • 120ml', pop:5},
  {id:'p2', name:'Vela Aromática Spa', price:39.9, category:'bem-estar', img:'assets/produto2.svg', meta:'Baunilha • 150g', pop:4},
  {id:'p3', name:'Jogo de Casal (Cartas)', price:59.9, category:'presentes', img:'assets/produto3.svg', meta:'50 desafios leves', pop:3},
  {id:'p4', name:'Massageador Discreto', price:189.9, category:'acessorios', img:'assets/produto4.svg', meta:'Silencioso • USB', pop:5},
  {id:'p5', name:'Lingerie Suave', price:89.9, category:'lingerie', img:'assets/produto5.svg', meta:'Tamanhos P–GG', pop:4},
  {id:'p6', name:'Gel Sensação Fresh', price:44.9, category:'bem-estar', img:'assets/produto6.svg', meta:'Dermatologicamente testado', pop:4},
  {id:'p7', name:'Kit Presente Afeto', price:129.9, category:'presentes', img:'assets/produto7.svg', meta:'Curadoria especial', pop:5},
  {id:'p8', name:'Necessaire Discreta', price:34.9, category:'acessorios', img:'assets/produto8.svg', meta:'Viagem', pop:2},
];

const fmt = (v)=> v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));

function setYear(){ const y = new Date().getFullYear(); const el = document.getElementById('year'); if(el) el.textContent = y; }
setYear();

// Age gate
(function(){
  const key='amora:age-ok';
  const banner = document.getElementById('ageBanner');
  if(!banner) return;
  const showed = localStorage.getItem(key);
  if(showed==='1'){ banner.classList.add('hidden'); return; }
  document.getElementById('ageYes').onclick=()=>{ localStorage.setItem(key,'1'); banner.classList.add('hidden'); };
  document.getElementById('ageNo').onclick=()=>{ window.location.href='https://www.google.com'; };
})();

// Cart logic
const Cart = {
  key: 'amora:cart',
  get(){ try{return JSON.parse(localStorage.getItem(this.key)||'[]')}catch{return[]} },
  set(items){ localStorage.setItem(this.key, JSON.stringify(items)); updateCartBadge(); },
  add(item){
    const items = this.get();
    const i = items.findIndex(x=>x.id===item.id);
    if(i>-1) items[i].qty += 1; else items.push({...item, qty:1});
    this.set(items); renderCart();
  },
  remove(id){ const items = this.get().filter(x=>x.id!==id); this.set(items); renderCart(); },
  inc(id){ const items = this.get(); const i = items.findIndex(x=>x.id===id); if(i>-1){ items[i].qty++; this.set(items); renderCart(); } },
  dec(id){ const items = this.get(); const i = items.findIndex(x=>x.id===id); if(i>-1){ items[i].qty=Math.max(1,items[i].qty-1); this.set(items); renderCart(); } },
  total(){ return this.get().reduce((s,x)=>s+x.price*x.qty,0) }
};

function updateCartBadge(){
  const count = Cart.get().reduce((s,x)=>s+x.qty,0);
  const el = document.getElementById('cartCount'); if(el) el.textContent = count;
}
updateCartBadge();

// Cart drawer UI
(function(){
  const drawer = document.getElementById('cartDrawer');
  const openBtn = document.getElementById('openCart');
  const closeBtn = document.getElementById('closeCart');
  if(!drawer || !openBtn || !closeBtn) return;
  openBtn.onclick=()=>{ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); renderCart(); };
  closeBtn.onclick=()=>{ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); };
  document.getElementById('checkoutBtn').onclick=(e)=>{
    e.preventDefault();
    alert('Checkout de demonstração. Integre um gateway de pagamento para finalizar compras reais.');
  }
})();

function renderCart(){
  const root = document.getElementById('cartItems'); if(!root) return;
  const items = Cart.get();
  root.innerHTML = items.length?'' : '<p class="muted">Seu carrinho está vazio.</p>';
  for(const it of items){
    const row = document.createElement('div');
    row.className='cart-item';
    row.innerHTML = `
      <img src="${it.img}" alt="${it.name}" width="64" height="48">
      <div>
        <div><strong>${it.name}</strong></div>
        <div class="muted tiny">${it.meta}</div>
        <div class="muted tiny">Preço: ${fmt(it.price)}</div>
      </div>
      <div style="display:grid;gap:6px;justify-items:end">
        <div>
          <button class="icon-btn" data-dec>-</button>
          <span style="padding:0 6px">${it.qty}</span>
          <button class="icon-btn" data-inc>+</button>
        </div>
        <button class="icon-btn" data-rm>Remover</button>
      </div>
    `;
    root.appendChild(row);
    row.querySelector('[data-inc]').onclick=()=>Cart.inc(it.id);
    row.querySelector('[data-dec]').onclick=()=>Cart.dec(it.id);
    row.querySelector('[data-rm]').onclick=()=>Cart.remove(it.id);
  }
  const total = document.getElementById('cartTotal'); if(total) total.textContent = fmt(Cart.total());
}

// Product grid render & filters (produtos.html)
(function(){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  const search = document.getElementById('searchInput');
  const cat = document.getElementById('categoryFilter');
  const sort = document.getElementById('sortSelect');

  function render(list){
    grid.innerHTML = '';
    for(const p of list){
      const card = document.createElement('article');
      card.className='card';
      card.innerHTML = `
        <img class="thumb" src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="body">
          <div class="title">${p.name}</div>
          <div class="meta">${p.meta}</div>
          <div class="price">${fmt(p.price)}</div>
        </div>
        <div class="actions">
          <button class="btn" data-add>Adicionar ao carrinho</button>
        </div>
      `;
      card.querySelector('[data-add]').onclick=()=>Cart.add(p);
      grid.appendChild(card);
    }
  }

  function apply(){
    let list = PRODUCTS.slice();
    const q = (search.value||'').toLowerCase();
    if(q) list = list.filter(p => (p.name+' '+p.meta).toLowerCase().includes(q));
    if(cat.value) list = list.filter(p => p.category===cat.value);
    if(sort.value==='asc') list.sort((a,b)=>a.price-b.price);
    else if(sort.value==='desc') list.sort((a,b)=>b.price-a.price);
    else list.sort((a,b)=>b.pop-a.pop);
    render(list);
  }

  search.addEventListener('input', apply);
  cat.addEventListener('change', apply);
  sort.addEventListener('change', apply);
  apply();
})();

// Contato (fake submit)
(function(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const msg = document.getElementById('contactMsg');
    msg.textContent = 'Mensagem enviada! Retornaremos em breve (demonstração).';
    form.reset();
  });
})();
