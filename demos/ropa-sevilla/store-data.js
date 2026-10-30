(()=>{
  const KEY='wn-ecom-demo-lead-271-v1';
  const clone=o=>JSON.parse(JSON.stringify(o));
  const defaults={
    store:{name:'Ropa Sevilla',handle:'@sevillastyle.360',location:'Sevilla',tagline:'Tu estilo. A tu ritmo.',shipping:'Envíos disponibles · condiciones ilustrativas'},
    products:[
      {id:'rs-101',name:'Sudadera Urban 360',category:'Ropa',price:39.90,stock:8,badge:'NUEVO',img:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=88',variants:{Talla:['S','M','L','XL'],Color:['Negro','Crudo']},active:true},
      {id:'rs-102',name:'Sneaker Street',category:'Zapatillas',price:54.90,stock:4,badge:'TOP',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=88',variants:{Talla:['37','38','39','40','41'],Color:['Rojo','Blanco']},active:true},
      {id:'rs-103',name:'Bolso Crossbody',category:'Bolsos',price:29.90,stock:2,badge:'ÚLTIMAS',img:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=88',variants:{Color:['Negro','Camel']},active:true},
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
  function save(state){localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('wn-store-updated',{detail:state}));return state}
  function reset(){localStorage.removeItem(KEY);return clone(defaults)}
  window.ROPA_DEMO={KEY,defaults:clone(defaults),load,save,reset,clone};
})();