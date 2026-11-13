/*
  إعدادات واصل:
  1) ضع رقم واتساب بصيغة دولية بدون + أو مسافات، مثال توضيحي فقط: 9677XXXXXXXX
  2) استبدل بيانات المنتجات والمتاجر التجريبية ببيانات حقيقية وبإذن أصحابها.
*/
const WASIL_CONFIG = {
  whatsappNumber: "967778674843",
  currency: "ر.ي"
};

const products = [
  {id:1,name:"عطر شرقي فاخر",store:"عبق للعطور",category:"العطور",price:18500,badge:"اختيار مميز",image:"https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=85"},
  {id:2,name:"حقيبة نسائية أنيقة",store:"متجر الأناقة",category:"الأزياء النسائية",price:22000,badge:"جديد",image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85"},
  {id:3,name:"ساعة يد كلاسيكية",store:"وقت وأناقة",category:"الإلكترونيات",price:27500,badge:"الأكثر طلباً",image:"https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=700&q=85"},
  {id:4,name:"قميص رجالي",store:"متجر الأناقة",category:"الأزياء الرجالية",price:12500,badge:"",image:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=85"},
  {id:5,name:"سماعات لاسلكية",store:"تقنية بلس",category:"الإلكترونيات",price:19500,badge:"جديد",image:"https://images.unsplash.com/photo-1509614107451-6e6f7c7b4e5d?auto=format&fit=crop&w=700&q=85"},
  {id:6,name:"عطر زهري ناعم",store:"عبق للعطور",category:"العطور",price:16000,badge:"",image:"https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=85"},
  {id:7,name:"مجموعة عناية بالبشرة",store:"لمسة جمال",category:"التجميل",price:14500,badge:"",image:"https://images.unsplash.com/photo-1601612628452-9e99ced43524?auto=format&fit=crop&w=700&q=85"},
  {id:8,name:"مصباح ديكور منزلي",store:"بيت جميل",category:"المنزل",price:17500,badge:"",image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85"},
  {id:9,name:"بخور وعود",store:"عبق للعطور",category:"العطور",price:12000,badge:"منتج محلي",image:"https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=85"},
  {id:10,name:"حذاء رياضي",store:"خطوة",category:"الأزياء الرجالية",price:24500,badge:"",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85"},
  {id:11,name:"طقم أكواب للقهوة",store:"بيت جميل",category:"المنزل",price:8500,badge:"",image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=85"},
  {id:12,name:"سلة تموين منزلية",store:"زاد البيت",category:"الأغذية",price:30000,badge:"",image:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=85"}
];

function readAdminProducts(){
  try{
    const saved = JSON.parse(localStorage.getItem("wasil_admin_products") || "[]");
    if(!Array.isArray(saved)) return [];
    return saved.map((item,index)=>{
      const name = String(item.name ?? item.title ?? item.productName ?? "").trim();
      const price = Number(item.price ?? item.productPrice);
      const category = String(item.category ?? item.section ?? "أخرى").trim();
      const store = String(item.store ?? item.storeName ?? item.shop ?? "متجر واصل").trim();
      const rawImage = String(item.image ?? item.imageUrl ?? item.photo ?? "").trim();
      let image = "https://placehold.co/700x700/f4f1ed/122746?text=WASIL";
      try{
        if(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(rawImage)) image = rawImage;
        else {
          const parsed = new URL(rawImage, window.location.href);
          if(["http:","https:"].includes(parsed.protocol)) image = parsed.href;
        }
      }catch(_){}
      if(!name || !Number.isFinite(price) || price < 0) return null;
      return {id:100000+index,name,store,category,price,badge:String(item.badge ?? "من متجر واصل"),image,_fromAdmin:true};
    }).filter(Boolean);
  }catch(error){
    console.warn("تعذر قراءة منتجات لوحة الإدارة:",error);
    return [];
  }
}
function refreshAdminProducts(){
  for(let i=products.length-1;i>=0;i--){
    if(products[i]._fromAdmin) products.splice(i,1);
  }
  readAdminProducts().forEach(p=>products.push(p));
}

refreshAdminProducts();

let cart = [];
let activeCategory = "الكل";
let currentProducts = [...products];

const money = value => `${Number(value).toLocaleString("en-US")} ${WASIL_CONFIG.currency}`;
const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const toast = document.getElementById("toast");

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(()=>toast.classList.remove("show"),2400);
}
function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function safeImage(value){
  try{
    const url=new URL(String(value || ""),window.location.href);
    if(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(String(value||""))) return String(value);
    return ["http:","https:"].includes(url.protocol) ? url.href : "https://placehold.co/700x700/f4f1ed/122746?text=WASIL";
  }catch(_){return "https://placehold.co/700x700/f4f1ed/122746?text=WASIL";}
}
function renderProducts(list){
  currentProducts = list;
  productGrid.innerHTML = list.length ? list.map(p=>`
    <article class="product-card">
      <div class="product-image">
        <img src="${safeImage(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.src='https://placehold.co/700x700/f4f1ed/122746?text=WASIL'">
        ${p.badge ? `<span class="product-badge">${escapeHTML(p.badge)}</span>` : ""}
      </div>
      <div class="product-info">
        <span class="product-store">${escapeHTML(p.store)} • ${escapeHTML(p.category)}</span>
        <h3>${escapeHTML(p.name)}</h3>
        <div class="product-bottom"><b class="price">${money(p.price)}</b><button class="add-button" data-add="${p.id}">+ أضف للسلة</button></div>
      </div>
    </article>`).join("") : `<p>لا توجد منتجات مطابقة لبحثك حالياً.</p>`;
  document.getElementById("resultCount").textContent = `${list.length} منتج`;
}
function filterProducts(){
  const term = document.getElementById("searchInput").value.trim().toLowerCase();
  let list = products.filter(p=>(activeCategory==="الكل" || p.category===activeCategory) &&
    [p.name,p.store,p.category].some(v=>v.toLowerCase().includes(term)));
  const sort = document.getElementById("sortSelect").value;
  if(sort==="low") list.sort((a,b)=>a.price-b.price);
  if(sort==="high") list.sort((a,b)=>b.price-a.price);
  renderProducts(list);
}
function addToCart(id){
  const item = products.find(p=>p.id===id);
  const existing = cart.find(p=>p.id===id);
  if(existing) existing.quantity++;
  else cart.push({...item,quantity:1});
  renderCart();
  showToast("تمت إضافة المنتج إلى السلة");
}
function renderCart(){
  const count = cart.reduce((sum,p)=>sum+p.quantity,0);
  const total = cart.reduce((sum,p)=>sum+p.price*p.quantity,0);
  document.getElementById("cartCount").textContent=count;
  document.getElementById("cartTotal").textContent=money(total);
  document.getElementById("cartItems").innerHTML = cart.length ? cart.map(p=>`
    <div class="cart-row"><img src="${p.image}" alt=""><div><b>${p.name}</b><small>${p.quantity} × ${money(p.price)}</small></div><button class="remove-item" data-remove="${p.id}">حذف</button></div>`).join("") : `<p class="empty-cart">سلتك فارغة حالياً.</p>`;
}
function openCart(){cartDrawer.classList.add("open");cartDrawer.setAttribute("aria-hidden","false");}
function closeCart(){cartDrawer.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");}
function validWhatsappNumber(){
  return /^\d{10,15}$/.test(WASIL_CONFIG.whatsappNumber);
}
function makeOrderMessage(){
  const lines = cart.map(p=>`- ${p.name} | ${p.store} | الكمية: ${p.quantity} | ${money(p.price*p.quantity)}`);
  const total = cart.reduce((sum,p)=>sum+p.price*p.quantity,0);
  const groups = [...new Set(cart.map(p=>p.store))];
  return `السلام عليكم، أريد الطلب من منصة واصل WASIL:\n${lines.join("\n")}\nالمتاجر في السلة: ${groups.join("، ")}\nالإجمالي التقريبي للمنتجات: ${money(total)}\nالمدينة: عدن\nالمنطقة والعنوان: (يرجى التواصل للتأكيد)\nأرجو تأكيد التوفر ورسوم التوصيل لكل متجر. هذه رسالة طلب تجريبية وليست طلباً محفوظاً في قاعدة بيانات.`;
}
function openWhatsApp(message){
  if(!validWhatsappNumber()){
    showToast("أضف رقم واتساب واصل الصحيح في ملف script.js أولاً");
    return;
  }
  const url=`https://wa.me/${WASIL_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url,"_blank","noopener,noreferrer");
}

document.getElementById("categoryGrid").addEventListener("click",e=>{
  const button=e.target.closest("[data-category]");
  if(!button)return;
  activeCategory=button.dataset.category;
  document.querySelectorAll(".category-card").forEach(b=>b.classList.toggle("active",b===button));
  filterProducts();
  document.getElementById("products").scrollIntoView({behavior:"smooth"});
});
productGrid.addEventListener("click",e=>{
  const button=e.target.closest("[data-add]");
  if(button)addToCart(Number(button.dataset.add));
});
document.getElementById("searchForm").addEventListener("submit",e=>{e.preventDefault();filterProducts();document.getElementById("products").scrollIntoView({behavior:"smooth"});});
document.getElementById("searchInput").addEventListener("input",filterProducts);
document.getElementById("sortSelect").addEventListener("change",filterProducts);
document.getElementById("cartButton").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
document.getElementById("drawerBackdrop").addEventListener("click",closeCart);
document.getElementById("cartItems").addEventListener("click",e=>{
  const button=e.target.closest("[data-remove]");
  if(!button)return;
  cart=cart.filter(p=>p.id!==Number(button.dataset.remove));
  renderCart();
});
document.getElementById("checkoutButton").addEventListener("click",()=>{
  if(!cart.length){showToast("أضف منتجاً إلى السلة أولاً");return;}
  openWhatsApp(makeOrderMessage());
});
document.getElementById("sellerWhatsapp").addEventListener("click",e=>{
  e.preventDefault();
  openWhatsApp("السلام عليكم، أرغب بالانضمام كتاجر في منصة واصل WASIL. أرجو تزويدي بتفاصيل التسجيل وعرض المنتجات.");
});
document.getElementById("year").textContent=new Date().getFullYear();
window.addEventListener("storage",event=>{
  if(event.key==="wasil_admin_products"){refreshAdminProducts();filterProducts();}
});
renderProducts(products);
renderCart();
