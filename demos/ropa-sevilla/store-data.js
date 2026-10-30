(()=>{
  const KEY='wn-ecom-demo-lead-271-v1';
  const CHANNEL='wn-ecom-demo-lead-271';
  const clone=o=>JSON.parse(JSON.stringify(o));
  const defaults={
    store:{name:'Ropa Sevilla',handle:'@sevillastyle.360',location:'Sevilla',tagline:'Tu estilo. A tu ritmo.',shipping:'Envíos disponibles · condiciones ilustrativas'},
    products:[
      {id:'rs-101',name:'Sudadera Urban 360',category:'Ropa',price:39.90,stock:8,badge:'NUEVO',img:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=88',variants:{Talla:['S','M','L','XL'],Color:['Negro','Crudo']},active:true},
      {id:'rs-102',name:'Sneaker Street',category:'Zapatillas',price:54.90,stock:4,badge:'TOP',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=88',variants:{Talla:['37','38','39','40','41'],Color:['Rojo','Blanco']},active:true},
      {id:'rs-103',name:'Bolso Crossbody',category:'Bolsos',price:29.90,stock:2,badge:'ÚLTIMAS',img:'https://images.unsplash.com/photo-1584917865442-de89df76afd3e?auto=format&fit=crop&w=1000&q=88',variants:{Color:['Negro','Camel']},active:true},
      {id:'rs-104',name:'Chaqueta Oversize',category:'Ropa',price:46.90,stock:6,badge:'',img:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=88',variants:{Talla:['S/M','M/L'],Color:['Khaki','Negro']},active:true},
      {id:'rs-105',name:'Gorra Essential',category:'Complementos',price:18.90,stock:12,badge:'',img:'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=88',variants:{Color:['Negro','Beige','Verde']},active:true},
      {id:'rs-106',name:'Camiseta Studio',category:'Ropa',price:24.90,stock:0,badge:'AGOTADO',img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=88',variants:{Talla:['S','M','L'],Color:['Blanco','Negro']},active:true}
    ],
    orders:[
      {id:'#1048',customer:'Lucía M.',email:'lucia@example.com',total:69.80,status:'Nuevo',date:'Hoy · 09:42',items:2,shipping:'Envío estándar'},
      {id:'#1047',customer:'Marta R.',email:'marta@example.com',total:54.90,status:'Preparando',date:'Ayer · 18:11',items:1,shipping:'Envío estándar'},
      {id:'#1046',customer:'Paula S.',email:'paula@example.com',total:83.70,status:'Enviado',date:'Ayer · 12:06',items:3,shipping:'Recogida / entrega'},
      {id:'#1045',customer:'Ana V.',email:'ana@example.com',total:39.90,status:'Entregado',date:'28 oct · 16:20',items:1,shipping:'Envío estándar'}
    ],
    customers:[
      {name:'Lucía M.',orders:3,total:142.70,last:'Hoy'},
      {name:'Marta R.',orders:2,total:94.80,last:'Ayer'},
      {name:'Paula S.',orders:4,total:217.40,last:'Ayer'},
      {name:'Ana V.',orders:1,total:39.90,last:'28 oct'}
    ],
    invoices:[
      {id:'F-2026-018',order:'#1046',customer:'Paula S.',amount:83.70,status:'Enviada'},
      {id:'F-2026-017',order:'#1045',customer:'Ana V.',amount:39.90,status:'Enviada'}
    ],
    metrics:{monthRevenue:1248.60,monthOrders:23,conversion:2.8}
  };
  function load(){try{const v=localStorage.getItem(KEY);return v?JSON.parse(v):clone(defaults)}catch{return clone(defaults)}}
  let bc=null;try{bc=new BroadcastChannel(CHANNEL)}catch{}
  function notify(state){
    try{window.dispatchEvent(new CustomEvent('wn-store-updated',{detail:clone(state)}))}catch{}
    try{bc&&bc.postMessage({type:'updated',at:Date.now()})}catch{}
  }
  function save(state){localStorage.setItem(KEY,JSON.stringify(state));notify(state);return state}
  function reset(){localStorage.removeItem(KEY);const next=clone(defaults);notify(next);return next}
  window.ROPA_DEMO={KEY,CHANNEL,defaults:clone(defaults),load,save,reset,clone};

  if(!/\/demos\/ropa-sevilla\/admin\/?$/.test(location.pathname)) return;

  const boot=()=>{
    const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
    if(!$('#dashboard')||!$('#products')||!$('#orders')) return;
    const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(n)||0);
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let state=load(), signature=JSON.stringify(state), editingId=null, currentView='dashboard';
    const toast=t=>{const el=$('#toast');if(!el)return;el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),1500)};
    const persist=()=>{save(state);signature=JSON.stringify(state);renderAll()};

    function go(id){
      if(!$('#'+id)) return;
      currentView=id;
      $$('.view').forEach(v=>v.classList.toggle('on',v.id===id));
      $$('.navBtn').forEach(b=>b.classList.toggle('on',b.dataset.view===id));
      const label=$(`.navBtn[data-view="${id}"] span`);
      if($('#viewTitle')) $('#viewTitle').textContent=label?.textContent||'Panel';
    }

    function renderDashboard(){
      const active=state.products.filter(p=>p.active), low=active.filter(p=>p.stock<=3);
      if($('#mRevenue')) $('#mRevenue').textContent=euro(state.metrics.monthRevenue);
      if($('#mOrders')) $('#mOrders').textContent=state.metrics.monthOrders;
      if($('#mLow')) $('#mLow').textContent=low.length;
      if($('#mConv')) $('#mConv').textContent=state.metrics.conversion+'%';
      if($('#recentOrders')) $('#recentOrders').innerHTML=state.orders.slice(0,4).map(o=>`<div class="order"><span><b>${esc(o.id)}</b><br><small>${esc(o.customer)} · ${esc(o.date)}</small></span><span class="hideMob">${o.items} artículo${o.items===1?'':'s'}</span><b class="hideMob">${euro(o.total)}</b><span class="chip ${esc(o.status)}">${esc(o.status)}</span></div>`).join('');
      if($('#lowStock')) $('#lowStock').innerHTML=low.length?low.map(p=>`<div class="low"><img src="${esc(p.img)}" alt=""><span><b>${esc(p.name)}</b><small>${esc(p.category)}</small></span><span class="stockNum">${p.stock} uds.</span></div>`).join(''):'<div class="emptyNote">Sin alertas de stock.</div>';
      if($('#navLow')) $('#navLow').textContent=low.length;
      if($('#navProducts')) $('#navProducts').textContent=active.length;
      if($('#navOrders')) $('#navOrders').textContent=state.orders.length;
    }

    function renderProducts(){
      const q=($('#productSearch')?.value||'').trim().toLowerCase();
      const list=state.products.filter(p=>!q||p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q));
      if(!$('#productRows')) return;
      $('#productRows').innerHTML=list.map(p=>`<tr><td><div class="prodCell"><img src="${esc(p.img)}" alt=""><span><b>${esc(p.name)}</b><br><small style="color:var(--muted)">${esc(p.id)}</small></span></div></td><td>${esc(p.category)}</td><td>${euro(p.price)}</td><td><div class="qtyControls"><button data-fix-stock="${esc(p.id)}" data-d="-1">−</button><b>${p.stock}</b><button data-fix-stock="${esc(p.id)}" data-d="1">+</button></div></td><td><span class="chip">${p.active?'Activo':'Oculto'}</span></td><td><button class="linkBtn" data-fix-edit="${esc(p.id)}">Editar</button> · <button class="linkBtn danger" data-fix-toggle="${esc(p.id)}">${p.active?'Ocultar':'Activar'}</button></td></tr>`).join('');
      $$('[data-fix-stock]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=state.products.find(x=>x.id===b.dataset.fixStock);if(!p)return;p.stock=Math.max(0,p.stock+Number(b.dataset.d||0));persist();toast('Stock actualizado')});
      $$('[data-fix-edit]').forEach(b=>b.onclick=e=>{e.stopPropagation();openProductModal(b.dataset.fixEdit)});
      $$('[data-fix-toggle]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=state.products.find(x=>x.id===b.dataset.fixToggle);if(!p)return;p.active=!p.active;persist();toast(p.active?'Producto activado':'Producto ocultado')});
    }

    function renderOrders(){
      if(!$('#orderRows')) return;
      $('#orderRows').innerHTML=state.orders.map(o=>`<tr><td><b>${esc(o.id)}</b></td><td>${esc(o.customer)}<br><small style="color:var(--muted)">${esc(o.email||'')}</small></td><td>${esc(o.date)}</td><td>${o.items}</td><td><b>${euro(o.total)}</b></td><td><select class="statusSelect" data-fix-order="${esc(o.id)}"><option ${o.status==='Nuevo'?'selected':''}>Nuevo</option><option ${o.status==='Preparando'?'selected':''}>Preparando</option><option ${o.status==='Enviado'?'selected':''}>Enviado</option><option ${o.status==='Entregado'?'selected':''}>Entregado</option></select></td></tr>`).join('');
      $$('[data-fix-order]').forEach(s=>s.onchange=()=>{const o=state.orders.find(x=>x.id===s.dataset.fixOrder);if(!o)return;o.status=s.value;persist();toast('Estado actualizado')});
    }

    function renderStock(){
      const active=state.products.filter(p=>p.active), low=active.filter(p=>p.stock<=3), out=active.filter(p=>p.stock===0);
      if($('#sLow')) $('#sLow').textContent=low.length;
      if($('#sOut')) $('#sOut').textContent=out.length;
      if($('#sUnits')) $('#sUnits').textContent=active.reduce((a,p)=>a+p.stock,0);
      if($('#sActive')) $('#sActive').textContent=active.length;
      if(!$('#stockRows')) return;
      $('#stockRows').innerHTML=active.map(p=>`<tr><td><div class="prodCell"><img src="${esc(p.img)}" alt=""><b>${esc(p.name)}</b></div></td><td><b>${p.stock}</b></td><td><span class="chip">${p.stock===0?'Agotado':p.stock<=3?'Bajo':'Correcto'}</span></td><td><div class="qtyControls"><button data-fix-stock="${esc(p.id)}" data-d="-1">−</button><button data-fix-stock="${esc(p.id)}" data-d="5">+5</button><button data-fix-stock="${esc(p.id)}" data-d="1">+1</button></div></td></tr>`).join('');
      $$('[data-fix-stock]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=state.products.find(x=>x.id===b.dataset.fixStock);if(!p)return;p.stock=Math.max(0,p.stock+Number(b.dataset.d||0));persist();toast('Stock actualizado')});
    }

    function renderCustomers(){if($('#customerRows')) $('#customerRows').innerHTML=state.customers.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${c.orders}</td><td>${euro(c.total)}</td><td>${esc(c.last)}</td></tr>`).join('')}
    function renderInvoices(){if($('#invoiceRows')){$('#invoiceRows').innerHTML=state.invoices.map(i=>`<tr><td><b>${esc(i.id)}</b></td><td>${esc(i.order)}</td><td>${esc(i.customer)}</td><td>${euro(i.amount)}</td><td><span class="chip Enviado">${esc(i.status)}</span></td><td><button class="linkBtn" data-fix-invoice>Enviar de nuevo</button></td></tr>`).join('');$$('[data-fix-invoice]').forEach(b=>b.onclick=()=>toast('Factura simulada enviada'))}}
    function renderShipping(){const q=state.orders.filter(o=>['Nuevo','Preparando'].includes(o.status));if($('#shippingQueue')) $('#shippingQueue').innerHTML=q.length?q.map(o=>`<div class="order"><span><b>${esc(o.id)}</b><br><small>${esc(o.customer)} · ${esc(o.shipping)}</small></span><span class="chip ${esc(o.status)}">${esc(o.status)}</span></div>`).join(''):'<div class="emptyNote">No hay pedidos pendientes de preparar.</div>'}
    function renderAll(){renderDashboard();renderProducts();renderOrders();renderStock();renderCustomers();renderInvoices();renderShipping();go(currentView)}

    function openProductModal(id=null){
      editingId=id;
      const p=id?state.products.find(x=>x.id===id):null;
      if($('#modalTitle')) $('#modalTitle').textContent=p?'Editar producto':'Nuevo producto';
      if($('#fName')) $('#fName').value=p?.name||'';
      if($('#fCategory')) $('#fCategory').value=p?.category||'Ropa';
      if($('#fPrice')) $('#fPrice').value=p?.price??29.90;
      if($('#fStock')) $('#fStock').value=p?.stock??5;
      if($('#fImg')) $('#fImg').value=p?.img||'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=88';
      if($('#fVariants')) $('#fVariants').value=p?Object.entries(p.variants||{}).map(([k,v])=>k+':'+v.join(',')).join('; '):'Talla:S,M,L; Color:Negro,Blanco';
      $('#shade')?.classList.add('on');$('#productModal')?.classList.add('on');
    }
    const closeModal=()=>{$('#shade')?.classList.remove('on');$('#productModal')?.classList.remove('on')};

    $$('.navBtn').forEach(b=>{b.onclick=e=>{e.preventDefault();e.stopPropagation();go(b.dataset.view)}});
    $$('[data-go]').forEach(b=>{b.onclick=e=>{e.preventDefault();e.stopPropagation();go(b.dataset.go)}});
    if($('#quickAdd')) $('#quickAdd').onclick=e=>{e.preventDefault();e.stopPropagation();openProductModal()};
    if($('#addProduct2')) $('#addProduct2').onclick=e=>{e.preventDefault();e.stopPropagation();openProductModal()};
    if($('#cancelModal')) $('#cancelModal').onclick=e=>{e.preventDefault();e.stopPropagation();closeModal()};
    if($('#shade')) $('#shade').onclick=closeModal;
    if($('#productSearch')) $('#productSearch').oninput=renderProducts;
    if($('#saveProduct')) $('#saveProduct').onclick=e=>{
      e.preventDefault();e.stopPropagation();
      const name=$('#fName')?.value.trim();if(!name)return toast('Escribe un nombre');
      const variants={};($('#fVariants')?.value||'').split(';').forEach(group=>{const [k,v]=group.split(':');if(k&&v)variants[k.trim()]=v.split(',').map(x=>x.trim()).filter(Boolean)});
      const data={name,category:$('#fCategory')?.value||'Ropa',price:Number($('#fPrice')?.value)||0,stock:Math.max(0,Number($('#fStock')?.value)||0),img:$('#fImg')?.value.trim()||'',variants};
      if(editingId){const p=state.products.find(x=>x.id===editingId);if(p)Object.assign(p,data)}else state.products.unshift({id:'rs-'+Date.now().toString().slice(-6),badge:'NUEVO',active:true,...data});
      persist();closeModal();go('products');toast(editingId?'Producto actualizado':'Producto creado');editingId=null;
    };
    if($('#resetDemo')) $('#resetDemo').onclick=e=>{e.preventDefault();e.stopPropagation();state=reset();signature=JSON.stringify(state);renderAll();toast('Demo restablecida')};

    function pullFresh(){
      const next=load(), nextSig=JSON.stringify(next);
      if(nextSig===signature) return;
      state=next;signature=nextSig;renderAll();toast('Panel actualizado');
    }
    window.addEventListener('storage',e=>{if(e.key===KEY)pullFresh()});
    window.addEventListener('focus',pullFresh);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pullFresh()});
    window.addEventListener('wn-store-updated',pullFresh);
    try{bc&&(bc.onmessage=pullFresh)}catch{}
    setInterval(pullFresh,750);

    renderAll();
    window.__ROPA_ADMIN_FIXED__=true;
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});
  else setTimeout(boot,0);
})();