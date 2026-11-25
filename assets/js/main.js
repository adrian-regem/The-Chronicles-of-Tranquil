const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

// Генератор начнёт показывать случайные цитаты после добавления утверждённой подборки.


// Sticky header: show the exact current page title after leaving its heading banner.
const siteHeader=document.querySelector(".site-header");
if(siteHeader){
 const currentHeading=document.querySelector(".page-heading h1");
 const activeNav=siteHeader.querySelector(".main-nav a.active");
 const pageTitle=currentHeading?.textContent.trim()||activeNav?.textContent.trim()||"Главная";
 const sectionLabel=document.createElement("span");
 sectionLabel.className="header-section-title";
 sectionLabel.textContent=pageTitle;
 sectionLabel.setAttribute("aria-hidden","true");
 siteHeader.append(sectionLabel);
 const updateHeader=()=>siteHeader.classList.toggle("is-scrolled",window.scrollY>130);
 window.addEventListener("scroll",updateHeader,{passive:true});updateHeader();
}

// Interactive map: horizontal wraparound like a globe, with vertical movement clamped to map edges.
const mapImage=document.querySelector("#period-map-image"),mapViewport=document.querySelector("#map-viewport");
const mapZoom=document.querySelector("#map-zoom"),mapZoomValue=document.querySelector("#map-zoom-value");
const mapZoomReset=document.querySelector("#map-zoom-reset"),mapComingSoon=document.querySelector("#map-coming-soon");
const mapZoomControls=document.querySelector(".map-zoom-controls"),mapPanHint=document.querySelector(".map-pan-hint");
let mapScale=1,mapX=0,mapY=0,mapDrag=null,touchPan=null;
let mapTrack=null,mapCopies=[],mapBaseWidth=0,mapBaseHeight=0;
const mapMod=(value,mod)=>((value%mod)+mod)%mod;
function setupMapTrack(){
 if(!mapImage||!mapViewport||!mapImage.naturalWidth)return;
 if(!mapTrack){
  mapTrack=document.createElement("div");mapTrack.className="map-image-track";
  mapImage.parentNode.insertBefore(mapTrack,mapImage);mapTrack.append(mapImage);
  mapCopies=[mapImage];
  for(let i=0;i<2;i++){const copy=mapImage.cloneNode();copy.removeAttribute("id");copy.alt="";copy.setAttribute("aria-hidden","true");copy.draggable=false;mapTrack.append(copy);mapCopies.push(copy);}
 }
 const previousWidth=mapBaseWidth,previousHeight=mapBaseHeight;
 const previousXProgress=previousWidth?mapMod(mapX+previousWidth,previousWidth)/previousWidth:0;
 const previousYProgress=previousHeight?mapY/previousHeight:0;
 mapBaseWidth=mapViewport.clientWidth;
 mapBaseHeight=mapBaseWidth*mapImage.naturalHeight/mapImage.naturalWidth;
 mapViewport.style.height=mapBaseHeight+"px";
 mapTrack.style.width=(mapBaseWidth*3)+"px";
 mapTrack.style.height=mapBaseHeight+"px";
 mapCopies.forEach(img=>{img.style.width=mapBaseWidth+"px";img.style.height=mapBaseHeight+"px";});
 if(previousWidth&&previousHeight){
  mapX=-mapBaseWidth+previousXProgress*mapBaseWidth;
  mapY=previousYProgress*mapBaseHeight;
 }else{
  mapX=-mapBaseWidth;mapY=0;
 }
 clampMapY();renderMap();
}
function clampMapY(){
 if(!mapBaseHeight||!mapViewport)return;
 const minY=Math.min(0,(mapViewport.clientHeight/mapScale)-mapBaseHeight);
 mapY=Math.max(minY,Math.min(0,mapY));
}
function renderMap(){
 if(!mapImage)return;
 if(mapTrack){
  mapTrack.style.transform=`translate3d(${mapX*mapScale}px,${mapY*mapScale}px,0) scale(${mapScale})`;
 }
 if(mapZoom)mapZoom.value=String(mapScale);
 if(mapZoomValue)mapZoomValue.textContent=Math.round(mapScale*100)+"%";
}
function resetMap(){mapScale=1;mapY=0;mapX=-mapBaseWidth;renderMap();}
function moveMap(dx,dy){
 if(!mapBaseWidth)return;
 mapX+=dx/mapScale;
 mapX=-mapBaseWidth+mapMod(mapX+mapBaseWidth,mapBaseWidth);
 mapY+=dy/mapScale;clampMapY();renderMap();
}
mapImage?.addEventListener("load",setupMapTrack);
if(mapImage?.complete&&mapImage.naturalWidth)setupMapTrack();
window.addEventListener("resize",()=>{if(mapImage&&!mapImage.hidden)setupMapTrack();},{passive:true});
document.querySelectorAll("[data-map-period]").forEach(button=>button.addEventListener("click",()=>{
 const period=button.dataset.mapPeriod,unknown=period==="unknown";
 const title=period==="artifact"?"Артефакт":"Порабощение";
 document.querySelectorAll("[data-map-period]").forEach(item=>{
  const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));
 });
 if(!mapImage)return;
 if(unknown){
  mapImage.hidden=true;mapCopies.forEach(img=>img.hidden=true);
  if(mapTrack)mapTrack.hidden=true;
  mapComingSoon.hidden=false;mapZoomControls.hidden=true;if(mapPanHint)mapPanHint.hidden=true;
 }else{
  mapImage.hidden=false;mapComingSoon.hidden=true;mapZoomControls.hidden=false;if(mapPanHint)mapPanHint.hidden=false;
  if(mapTrack)mapTrack.hidden=false;
  const src=period==="artifact"?"/assets/images/maps/Транквил%20(1).png":"/assets/images/maps/Транквил.png";
  mapCopies.forEach(img=>{img.src=src;img.hidden=false;});
  mapImage.alt="Карта мира — период \""+title+"\"";
  if(mapImage.complete&&mapImage.naturalWidth)setupMapTrack();
 }
}));
mapImage?.addEventListener("error",()=>{const err=document.querySelector("#map-image-error");if(err)err.hidden=false;});
mapImage?.addEventListener("load",()=>{const err=document.querySelector("#map-image-error");if(err)err.hidden=true;setupMapTrack();});
mapZoom?.addEventListener("input",()=>{
 const oldScale=mapScale;mapScale=Number(mapZoom.value);
 // Keep the vertical centre stable while changing scale, then clamp to the map's edges.
 const centreY=mapY+mapViewport.clientHeight/(2*oldScale);
 mapY=centreY-mapViewport.clientHeight/(2*mapScale);clampMapY();renderMap();
});
mapZoomReset?.addEventListener("click",resetMap);
mapViewport?.addEventListener("pointerdown",e=>{
 if(e.pointerType==="touch"||e.target.closest(".map-zoom-controls")||mapImage?.hidden)return;
 mapDrag={id:e.pointerId,x:e.clientX,y:e.clientY};
 mapViewport.setPointerCapture(e.pointerId);mapViewport.classList.add("is-dragging");
});
mapViewport?.addEventListener("pointermove",e=>{
 if(!mapDrag||mapDrag.id!==e.pointerId)return;
 moveMap(e.clientX-mapDrag.x,e.clientY-mapDrag.y);mapDrag.x=e.clientX;mapDrag.y=e.clientY;
});
function stopMapDrag(e){if(!mapDrag||(e&&mapDrag.id!==e.pointerId))return;mapDrag=null;mapViewport?.classList.remove("is-dragging");}
mapViewport?.addEventListener("pointerup",stopMapDrag);mapViewport?.addEventListener("pointercancel",stopMapDrag);
mapViewport?.addEventListener("touchstart",e=>{
 if(e.target.closest(".map-zoom-controls")||mapImage?.hidden)return;
 if(e.touches.length===2){
  e.preventDefault();
  const a=e.touches[0],b=e.touches[1];
  touchPan={mode:"pinch",x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2,distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)};
 }else if(e.touches.length===1){
  touchPan={mode:"pan",x:e.touches[0].clientX,y:e.touches[0].clientY};
 }
},{passive:false});
mapViewport?.addEventListener("touchmove",e=>{
 if(e.target.closest(".map-zoom-controls"))return;
 if(e.touches.length===2&&touchPan?.mode==="pinch"){
  e.preventDefault();
  const a=e.touches[0],b=e.touches[1];
  const mid={x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2};
  const distance=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  const rect=mapViewport.getBoundingClientRect();
  const oldScale=mapScale;
  const nextScale=Math.max(1,Math.min(4,oldScale*(distance/(touchPan.distance||distance))));
  const localX=mid.x-rect.left,localY=mid.y-rect.top;
  const mapPointX=localX/oldScale-mapX,mapPointY=localY/oldScale-mapY;
  mapScale=nextScale;
  mapX=localX/mapScale-mapPointX;
  mapY=localY/mapScale-mapPointY;
  mapX=-mapBaseWidth+mapMod(mapX+mapBaseWidth,mapBaseWidth);
  clampMapY();renderMap();
  touchPan={mode:"pinch",x:mid.x,y:mid.y,distance};
 }else if(e.touches.length===1&&touchPan?.mode==="pan"){
  e.preventDefault();
  const next={x:e.touches[0].clientX,y:e.touches[0].clientY};
  moveMap(next.x-touchPan.x,next.y-touchPan.y);
  touchPan={mode:"pan",...next};
 }
},{passive:false});
mapViewport?.addEventListener("touchend",e=>{
 if(e.target.closest(".map-zoom-controls"))return;
 if(e.touches.length===1){
  touchPan={mode:"pan",x:e.touches[0].clientX,y:e.touches[0].clientY};
 }else if(e.touches.length===0)touchPan=null;
},{passive:true});
mapViewport?.addEventListener("touchcancel",()=>{touchPan=null;},{passive:true});

// Expandable catalogs: each section has its own single-open selection.
const bookData={
 enslavement:{
  title:"Порабощение",cover:"Обложка Порабощение.png",eyebrow:"Книга первая",
  synopsis:"Первая часть цикла «Хроники Транквила» рассказывает о поиске свободы. Её ищут и находят в разных ипостасях: кто-то желает сбежать от своего долга, кто-то — наоборот, исполнить его. Одни пытаются избежать наказания, а другие же хотят остаться героями. Иные стремятся к спокойной жизни.\n\nПерсонажи сталкиваются с различными испытаниями, раскрывая тайны и расправляясь с трудностями на своём пути. Сюжет затрагивает темы дружбы, предательства и власти, а также исследует сложные моральные дилеммы.",
  metadata:[["Объём","612 бумажных страниц"],["Дата выпуска","22 октября 2020 г."]],
  stores:[
   {format:"Электронная версия",items:[
    {brand:"Ridero",mark:"R",url:"https://ridero.ru/books/khroniki_trankvila_poraboshenie/"},
    {brand:"Я Книги",mark:"Я",url:"https://books.yandex.ru/books/fbYn3qVZ?username=b0748768650&utm_place=content_book_menu_item"},
    {brand:"Литрес",mark:"Л",url:"https://www.litres.ru/book/nikita-dmitrichev/hroniki-trankvila-poraboschenie-63015983/"},
    {brand:"Ozon",mark:"OZON",url:"https://ozon.ru/t/9i1GIsn"}
   ]},
   {format:"Печатная версия",items:[
    {brand:"Ridero",mark:"R",url:"https://ridero.ru/books/khroniki_trankvila_poraboshenie/"},
    {brand:"Ozon",mark:"OZON",url:"https://ozon.ru/t/vFsYIt8"},
    {brand:"Wildberries",mark:"WB",url:"https://www.wildberries.ru/catalog/36147651/detail.aspx?targetUrl=SN"}
   ]}
  ],
  next:"artifact"
 },
 artifact:{
  title:"Артефакт",cover:"Обложка Артефакт.png",eyebrow:"Книга вторая",
  synopsis:"Долгожданное продолжение первой книги, поднимающее проблему несправедливости мира, когда только обладатели ведьмовской крови могут управлять магией и быть на ступень выше простых людей.\n\nЧерез глубокие и живые истории персонажей автор заставляет задуматься о роли обычного человека в глобальных для всей планеты потрясениях. Что лучше: поддаться течению или стоять у руля?",
  metadata:[["Объём","540 страниц"],["Дата выпуска","9 февраля 2024 г."]],
  stores:[
   {format:"Электронная версия",items:[
    {brand:"Ridero",mark:"R",url:"https://ridero.ru/books/khroniki_trankvila_artefakt/"},
    {brand:"Литрес",mark:"Л",url:"https://www.litres.ru/book/nikita-dmitrichev/hroniki-trankvila-artefakt-70354606/"},
    {brand:"Ozon",mark:"OZON",url:"https://ozon.ru/t/TUzqnEQ"},
    {brand:"Я Книги",mark:"Я",url:"https://bookmate.ru/books/uVpnXmKp"}
   ]},
   {format:"Печатная версия",items:[
    {brand:"Ridero",mark:"R",url:"https://ridero.ru/books/khroniki_trankvila_artefakt/"},
    {brand:"Wildberries",mark:"WB",url:"https://www.wildberries.ru/catalog/209742637/detail.aspx?targetUrl=SN"}
   ]}
  ],
  previous:"enslavement",next:"third"
 },
 third:{title:"Третья книга",cover:"Обложка Неизвестно.png",eyebrow:"Книга третья",synopsis:"Название, аннотация и подробности третьей книги будут опубликованы позднее.",metadata:[],stores:[],status:"Название пока не объявлено",previous:"artifact"},
 "golden-wings":{
  title:"Золотые крылья",cover:"Обложка Золотые крылья.png",eyebrow:"Спин-офф",
  excerpt:"— Выходит, она была единственной выжившей?\n— Нет, многие сторонники королевы сбежали ещё до чистки. Но благодаря именно этой ведьме сохранились многие считавшиеся утерянными знания. То, что ведьмы сейчас в принципе существуют, именно её заслуга.\n— Это был большой подвиг. Как её звали?\n— Сорция Век. По крайней мере, именно это имя ей приписывают в легендах. Всё произошло пятьсот лет назад, не осталось никого, кто бы мог всё подтвердить.",
  metadata:[["Объём","144 страницы"],["Дата выпуска","21 июня 2024 г."]],
  stores:[
   {format:"Электронная версия",items:[
    {brand:"Ridero",mark:"R",url:"https://ridero.ru/books/zolotye_krylya_1/"},
    {brand:"Литрес",mark:"Л",url:"https://www.litres.ru/book/nikita-dmitrichev/zolotye-krylya-70821091/?lfrom=1166021823&ref_key=81e481cffebfbbeb4a6a51e08cd05f25b2e05c5d9ba0eaf59f4eea1da571c736&ref_offer=1"},
    {brand:"Ozon",mark:"OZON",url:"https://ozon.ru/t/9i1GBfD"},
    {brand:"Я Книги",mark:"Я",url:"https://bookmate.ru/books/z6DAfe2w"}
   ]},
   {format:"Печатная версия",items:[
    {brand:"Ridero",mark:"R",url:"https://ridero.ru/books/zolotye_krylya_1/"},
    {brand:"Ozon",mark:"OZON",url:"https://ozon.ru/t/rhl7NiG"},
    {brand:"Wildberries",mark:"WB",url:"https://www.wildberries.ru/catalog/239852599/detail.aspx?targetUrl=SN"}
   ]}
  ],
  relationLabel:"Связана с:",forBook:{id:"artifact",title:"Артефакт",cover:"Обложка Артефакт.png"}
 },
 "guide-enslavement":{
  title:"Путеводитель по Порабощению",cover:"Обложка Путеводитель по Порабощению.png",eyebrow:"Справочник",
  synopsis:"«Хроники Транквила: Порабощение» стала первой книгой цикла. Вмещая в себя более 600 страниц и 60 персонажей, она может стать настоящим испытанием на внимательность.\n\nДля комфортного читательского опыта автор публикует удобный вариант своего справочника, которым и сам пользовался при работе над рукописью. Он содержит имена, портреты и титулы героев, карту мира, а также прочие важные мелочи.",
  metadata:[],
  stores:[{format:"Бесплатная электронная версия",items:[{brand:"Ridero",mark:"R",url:"https://ridero.ru/books/putevoditel_po_porabosheniyu/"}]}],
  forBook:{id:"enslavement",title:"Порабощение",cover:"Обложка Порабощение.png"}
 },
 "guide-artifact":{
  title:"Путеводитель по Артефакту",cover:"Обложка Путеводитель по Артефакту.png",eyebrow:"Справочник",
  synopsis:"«Хроники Транквила: Артефакт» и «Золотые крылья» продолжили основной сюжет цикла, рассказав свою историю. Насчитывая в общей сумме более 600 страниц и 120 персонажей, они могут стать настоящим испытанием на внимательность.\n\nДля комфортного читательского опыта автор публикует удобный вариант своего справочника, которым и сам пользовался при работе над рукописью. Он содержит имена, портреты и титулы героев, карту мира, а также прочие важные мелочи.",
  metadata:[],
  stores:[{format:"Бесплатная электронная версия",items:[{brand:"Ridero",mark:"R",url:"https://ridero.ru/books/putevoditel_po_artefaktu/"}]}],
  forBooks:[{id:"artifact",title:"Артефакт",cover:"Обложка Артефакт.png"},{id:"golden-wings",title:"Золотые крылья",cover:"Обложка Золотые крылья.png"}]
 },
 "guide-unknown":{title:"Неизвестный справочник",cover:"Обложка Неизвестно.png",eyebrow:"Справочник",synopsis:"Название и содержание третьего справочника будут объявлены позднее.",metadata:[],stores:[],status:"Информация появится позже",forBook:{id:"third",title:"???",cover:"Обложка Неизвестно.png"}}
};
function makeBookLink(id,label,cover,klass){
 const image=cover?'<img src="/assets/images/books/'+encodeURIComponent(cover)+'" alt="">':"";
 return '<button type="button" class="'+klass+'" data-open-book="'+id+'"><span class="book-mini-cover" aria-hidden="true">'+image+'</span><span>'+label+'</span></button>';
}
function openMainBook(id){
 const mainSelector=document.querySelector('[data-book-selector="chronicles"]');
 const target=mainSelector?.querySelector('[data-book="'+id+'"]');
 if(!target)return;
 const already=target.classList.contains("is-active");
 if(already){mainSelector.scrollIntoView({behavior:"smooth",block:"center"});return;}
 target.click();
 mainSelector.scrollIntoView({behavior:"smooth",block:"center"});
}
function renderStoreGroups(stores){
 if(!stores?.length)return "";
 const storeLogos={
  "Ridero":"Лого Ridero.png",
  "Я Книги":"Лого Яндекс Книги.png",
  "Литрес":"Лого Литрес.png",
  "Ozon":"Лого Ozon.png",
  "Wildberries":"Лого WB.png"
 };
 return '<div class="book-store-groups">'+stores.map(group=>'<section class="book-store-group"><h4>'+group.format+'</h4><div class="book-store-list">'+group.items.map(store=>{
  const logo=storeLogos[store.brand];
  const mark=logo?'<img class="book-store-logo" src="/assets/images/icons/'+encodeURIComponent(logo)+'" alt="">':'<span class="book-store-mark">'+(store.mark||"")+'</span>';
  return '<a class="book-store-link" href="'+store.url+'" target="_blank" rel="noopener noreferrer" aria-label="'+group.format+': '+store.brand+'" title="'+store.brand+': '+group.format+'">'+mark+'<span class="book-store-name">'+store.brand+'</span></a>';
 }).join("")+'</div></section>').join("")+'</div>';
}
document.querySelectorAll("[data-book-selector]").forEach(selector=>{
 const details=selector.querySelector(".book-details");
 selector.querySelectorAll(".book-choice").forEach(button=>button.addEventListener("click",()=>{
  const active=button.classList.contains("is-active");
  selector.querySelectorAll(".book-choice").forEach(item=>{
   item.classList.remove("is-active");item.setAttribute("aria-expanded","false");item.style.gridRow="";
  });
  if(active){selector.classList.remove("is-expanded");details.hidden=true;return;}
  const data=bookData[button.dataset.book],all=[...selector.querySelectorAll(".book-choice")],idx=all.indexOf(button);
  all.forEach(item=>{item.style.gridRow="1";});
  button.classList.add("is-active");button.setAttribute("aria-expanded","true");
  selector.classList.add("is-expanded");details.hidden=false;details.style.gridRow="1";
  const relatedBooks=data.forBooks||(data.forBook?[data.forBook]:[]);
  const forExtra=relatedBooks.length?'<div class="book-for-row"><span class="book-for-label">'+(data.relationLabel||"Для книг:")+'</span>'+relatedBooks.map(book=>makeBookLink(book.id,book.title,book.cover,"book-for-link")).join("")+'</div>':"";
  let extra="";
  if(data.previous||data.next){
   extra+='<div class="book-cycle-nav">';
   if(data.previous){const p=bookData[data.previous];extra+='<div class="book-cycle-item"><span class="book-cycle-label">Предыдущая книга цикла</span>'+makeBookLink(data.previous,p.title,p.cover||"Ⅰ","book-cycle-link")+'</div>';}
   if(data.next){const n=bookData[data.next];extra+='<div class="book-cycle-item book-cycle-item-next"><span class="book-cycle-label">Следующая книга цикла</span>'+makeBookLink(data.next,n.title,n.cover||"Ⅱ","book-cycle-link")+'</div>';}
   extra+='</div>';
  }
  const cover=data.cover?'<img class="book-detail-cover" src="/assets/images/books/'+encodeURIComponent(data.cover)+'" alt="">':"";
  const metadata=data.metadata?.length?'<dl class="book-metadata">'+data.metadata.map(item=>'<div><dt>'+item[0]+'</dt><dd>'+item[1]+'</dd></div>').join("")+'</dl>':"";
  const synopsis=data.synopsis?'<p class="book-synopsis">'+data.synopsis.replace(/\n\n/g,"</p><p class=\"book-synopsis\">")+'</p>':"";
  const excerpt=data.excerpt?'<blockquote class="book-excerpt">'+data.excerpt.replace(/\n/g,"<br>")+'</blockquote>':"";
  const status=data.status?'<p class="book-detail-status">'+data.status+'</p>':"";
  details.innerHTML='<div class="book-detail-heading">'+cover+'<div class="book-detail-title"><p class="eyebrow">'+data.eyebrow+'</p><h3>'+data.title+'</h3>'+metadata+'</div></div>'+forExtra+synopsis+excerpt+status+renderStoreGroups(data.stores)+extra;
 }));
});
document.addEventListener("click",e=>{
 const link=e.target.closest("[data-open-book]");
 if(!link)return;
 e.preventDefault();openMainBook(link.dataset.openBook);
});
// Dynamic encyclopedia: versioned records, reading progress and category filters.
const guideRoot=document.querySelector(".guide-dictionary");
if(guideRoot){
 const guideSearch=document.querySelector("#guide-search");
 const guideSlider=document.querySelector("#guide-progress-slider");
 const guideFill=document.querySelector("#guide-progress-fill");
 const guideCurrent=document.querySelector("#guide-progress-current");
 const guidePoints=document.querySelector("#guide-progress-points");
 const guideTagOptions=document.querySelector("#guide-tag-options");
 const guideResults=document.querySelector("#guide-results");
 const guideStages=[
  {book:"Порабощение",phase:"Повествование",cover:"Обложка Порабощение.png"},
  {book:"Порабощение",phase:"Финал",cover:"Обложка Порабощение.png"},
  {book:"Артефакт",phase:"Повествование",cover:"Обложка Артефакт.png"},
  {book:"Артефакт",phase:"Финал",cover:"Обложка Артефакт.png"},
  {book:"Золотые крылья",phase:"Повествование",cover:"Обложка Золотые крылья.png"},
  {book:"Золотые крылья",phase:"Финал",cover:"Обложка Золотые крылья.png"},
  {book:"???",phase:"Повествование",cover:"Обложка Неизвестно.png",disabled:true},
  {book:"???",phase:"Финал",cover:"Обложка Неизвестно.png",disabled:true}
 ];
 const guideCategories=[
  ["Персонаж","user-round"],["Место","map-pin"],["Власть","crown"],["Фракция","users"],
  ["Магия","wand-sparkles"],["История","scroll-text"],["Культура","landmark"],["Религия","church"],
  ["Биология","dna"],["Объект","gem"]
 ];
 const guideIconPaths={
  "sliders-horizontal":'<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4"/>',
  "image":'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  "user-round":'<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
  "dna":'<path d="M7 3c10 0 10 18 0 18"/><path d="M17 3C7 3 7 21 17 21"/><path d="M8 7h8M7 12h10M8 17h8"/>',
  "crown":'<path d="m2 7 5 4 5-7 5 7 5-4-2 13H4L2 7Z"/><path d="M4 17h16"/>',
  "landmark":'<path d="m3 9 9-6 9 6H3Z"/><path d="M4 21h16M5 10v8m5-8v8m4-8v8m5-8v8M3 21h18"/>',
  "wand-sparkles":'<path d="m15 4 5 5M4 20 16 8M3 6l1-3 1 3 3 1-3 1-1 3-1-3-3-1 3-1Zm14 12 1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"/>',
  "map-pin":'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  "users":'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  "gem":'<path d="M6 3h12l4 6-10 12L2 9l4-6Z"/><path d="m2 9 20 0M6 3l3 6 3 12 3-12 3-6"/>',
  "church":'<path d="M12 2v5m-3-2h6M4 10l8-5 8 5v11H4V10Z"/><path d="M9 21v-6h6v6M2 21h20"/>',
  "scroll-text":'<path d="M8 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h1Z"/><path d="M8 3v14a2 2 0 0 1-2 2m6-10h5m-5 4h5"/>'
 };
 const guideIcon=name=>'<svg class="guide-inline-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(guideIconPaths[name]||"")+'</svg>';
 const escapeGuide=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
 const highlightGuide=(value,query)=>{
  const source=String(value??"");if(!query)return escapeGuide(source);
  const lower=source.toLocaleLowerCase("ru"),needle=query.toLocaleLowerCase("ru");
  let result="",position=0,found;
  while((found=lower.indexOf(needle,position))!==-1){
   result+=escapeGuide(source.slice(position,found))+'<mark class="guide-search-match">'+escapeGuide(source.slice(found,found+query.length))+'</mark>';
   position=found+query.length;
  }
  return result+escapeGuide(source.slice(position));
 };
 let guideProgress=1;
 guideSlider.max="8";
 try{const saved=Number(localStorage.getItem("tranquil-guide-progress"));if(Number.isInteger(saved)&&saved>=1&&saved<=6)guideProgress=saved;}catch(e){}
 guideSlider.value=String(guideProgress);
 guidePoints.innerHTML=guideStages.map((stage,index)=>{
  const cover=stage.cover?'<img src="/assets/images/books/'+encodeURIComponent(stage.cover)+'" alt="">'+(stage.phase==="Финал"?'<span class="guide-progress-final-check" aria-label="Книга дочитана">✓</span>':""):"";
  return '<span class="guide-progress-point'+(stage.disabled?' is-disabled':'')+'" data-stage="'+(index+1)+'"><i></i>'+cover+'<small>'+escapeGuide(stage.book)+'<br>'+escapeGuide(stage.phase)+'</small></span>';
 }).join("");
 guideTagOptions.innerHTML='<button type="button" class="guide-tag-all is-active" data-guide-tag-all aria-pressed="true">Все</button>'+guideCategories.map(([label,icon])=>'<label class="guide-tag-option"><input type="checkbox" value="'+escapeGuide(label)+'"><span class="guide-tag-option-icon">'+guideIcon(icon)+'</span><span>'+escapeGuide(label)+'</span></label>').join("")+'<label class="guide-tag-option"><input type="checkbox" value="__portrait"><span class="guide-tag-option-icon">'+guideIcon("image")+'</span><span>Портрет</span></label>';
 const filterHeadingIcon=document.querySelector(".guide-filter-heading-icon");
 if(filterHeadingIcon)filterHeadingIcon.innerHTML=guideIcon("sliders-horizontal");
 let guideGroups=[];
 const selectedVersions=new Map();
 const categoryIcon=new Map(guideCategories);
 function updateProgressDisplay(){
  const stage=guideStages[guideProgress-1];
  guideCurrent.textContent=stage.book+" · "+stage.phase;
  const fillPercent=((guideProgress-1)/7*100);
  guideSlider.style.setProperty("--guide-progress",fillPercent+"%");
  if(guideFill)guideFill.style.setProperty("--guide-progress",fillPercent+"%");
  guidePoints.querySelectorAll(".guide-progress-point").forEach(point=>{
   const n=Number(point.dataset.stage);point.classList.toggle("is-past",n<guideProgress);point.classList.toggle("is-current",n===guideProgress);
  });
 }
 function makeSnapshots(records){
  const state={};const fields=["name","portrait","description","tags"];
  return records.map(record=>{
   fields.forEach(field=>{if(Object.prototype.hasOwnProperty.call(record,field))state[field]=record[field];});
   return {record:record,state:{...state,tags:Array.isArray(state.tags)?state.tags.slice():state.tags}};
  });
 }
 function versionLabel(version){
  const stage=guideStages[version-1]||{book:"???",phase:""};
  return stage.book+" · "+stage.phase;
 }
 function portraitFolder(tags){
  if(tags.includes("Персонаж"))return "characters";
  if(tags.includes("Место"))return "places";
  if(tags.includes("Фракция"))return "factions";
  if(tags.includes("Объект"))return "objects";
  return "characters";
 }
 function renderCard(group){
  const available=group.snapshots.filter(item=>item.record.version<=guideProgress);
  if(!available.length)return "";
  const lastAvailable=available[available.length-1];
  let active=lastAvailable;
  const remembered=selectedVersions.get(String(group.objectId));
  if(remembered){const match=available.find(item=>String(item.record.recordId)===String(remembered));if(match)active=match;}
  const state=active.state;
  const name=state.name||"Без названия";
  const tags=Array.isArray(state.tags)?state.tags.filter(tag=>categoryIcon.has(tag)):[];
  const desc=state.description==null?"":String(state.description);
  const portrait=state.portrait?"/assets/images/characters/"+encodeURIComponent(state.portrait):"";
  const tagMarkup=tags.map(tag=>'<span class="guide-entry-tag">'+guideIcon(categoryIcon.get(tag))+'<span>'+escapeGuide(tag)+'</span></span>').join("");
  const tabs=group.snapshots.map(item=>{
   const locked=item.record.version>guideProgress;
   const label=versionLabel(item.record.version);
   const activeTab=!locked&&String(item.record.recordId)===String(active.record.recordId);
   return '<button type="button" class="guide-version-tab'+(activeTab?' is-active':'')+(locked?' is-locked':'')+'" data-guide-version="'+escapeGuide(item.record.recordId)+'" data-guide-stage="'+item.record.version+'" aria-pressed="'+String(activeTab)+'" title="'+(locked?'Откроется после чтения: '+label:label)+'">'+(locked?'<span class="guide-lock-symbol" aria-label="Заблокировано"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>':'')+'<span>'+escapeGuide(label)+'</span></button>';
  }).join("");
  const searchText=[name,desc,tags.join(" "),versionLabel(active.record.version),String(group.objectId)].join(" ").toLocaleLowerCase("ru");
  const portraitMarkup=portrait?'<button type="button" class="guide-portrait-open" aria-label="Открыть портрет: '+escapeGuide(name)+'"><img src="'+portrait+'" alt="Портрет: '+escapeGuide(name)+'" loading="lazy" onerror="this.hidden=true;this.closest(&quot;.guide-card-portrait&quot;).classList.add(&quot;is-fallback&quot;)"></button>':'';
  const query=(guideSearch.value||"").trim();
  return '<article class="guide-card" data-guide-entry data-object-id="'+escapeGuide(group.objectId)+'" data-search="'+escapeGuide(searchText)+'" data-tags="'+escapeGuide(tags.join("|"))+'" data-has-portrait="'+String(Boolean(portrait))+'">'+
   '<div class="guide-card-main"><div class="guide-card-portrait'+(portrait?'':' is-fallback')+'">'+portraitMarkup+'<span aria-hidden="true">'+escapeGuide(name.trim().slice(0,1).toLocaleUpperCase("ru"))+'</span></div>'+
   '<div class="guide-card-content"><div class="guide-card-title-row"><h3 data-guide-name="'+escapeGuide(name)+'">'+highlightGuide(name,query)+'</h3><span class="guide-object-id">#'+escapeGuide(group.objectId)+'</span></div>'+
   '<div class="guide-entry-tags">'+tagMarkup+'</div><p class="guide-card-description" data-guide-description="'+escapeGuide(desc)+'">'+(desc?highlightGuide(desc,query):'<span class="guide-no-description">Описание пока отсутствует.</span>')+'</p></div></div>'+
   '<div class="guide-card-versions" aria-label="Версии записи">'+tabs+'</div><p class="guide-lock-note" role="status" hidden></p></article>';
 }
 function applyGuideFilters(){
  const query=(guideSearch.value||"").trim().toLocaleLowerCase("ru");
  const checkedInputs=[...guideTagOptions.querySelectorAll('input[type="checkbox"]:checked')];
  const portraitOnly=checkedInputs.some(input=>input.value==="__portrait");
  const checked=checkedInputs.filter(input=>input.value!=="__portrait").map(input=>input.value);
  const cards=[...guideResults.querySelectorAll("[data-guide-entry]")];let visible=0;
  cards.forEach(card=>{
   const tags=(card.dataset.tags||"").split("|").filter(Boolean);
   const matchesQuery=!query||(card.dataset.search||"").includes(query);
   const matchesTags=!checked.length||tags.some(tag=>checked.includes(tag));
   const matchesPortrait=!portraitOnly||card.dataset.hasPortrait==="true";
   card.hidden=!(matchesQuery&&matchesTags&&matchesPortrait);if(!card.hidden)visible++;
   const name=card.querySelector("[data-guide-name]"),description=card.querySelector("[data-guide-description]");
   if(name)name.innerHTML=highlightGuide(name.dataset.guideName,query);
   if(description)description.innerHTML=description.dataset.guideDescription?highlightGuide(description.dataset.guideDescription,query):'<span class="guide-no-description">Описание пока отсутствует.</span>';
  });
  let empty=guideResults.querySelector(".guide-no-matches");
  if(!visible&&cards.length){if(!empty){empty=document.createElement("p");empty.className="guide-no-matches";empty.textContent="По заданным условиям ничего не найдено.";guideResults.append(empty);}empty.hidden=false;}
  else if(empty)empty.hidden=true;
 }
 function renderCards(){
  updateProgressDisplay();
  const sorted=guideGroups.slice().sort((a,b)=>{
   const an=(a.snapshots.filter(x=>x.record.version<=guideProgress).slice(-1)[0]?.state.name||"").trim();
   const bn=(b.snapshots.filter(x=>x.record.version<=guideProgress).slice(-1)[0]?.state.name||"").trim();
   const aq=/^[\u00ab\u201e\u201c"']/.test(an),bq=/^[\u00ab\u201e\u201c"']/.test(bn);
   if(aq!==bq)return aq?1:-1;
   return an.localeCompare(bn,"ru");
  });
  const cards=sorted.map(renderCard).filter(Boolean);
  guideResults.innerHTML=cards.length?'<div class="guide-card-grid">'+cards.join("")+'</div>':'<div class="guide-empty"><span class="guide-empty-mark">⌕</span><h2>Пока нет доступных записей</h2><p>На выбранном этапе чтения справочник ещё не содержит открытых материалов.</p></div>';
  applyGuideFilters();
 }
 guidePoints.addEventListener("click",event=>{
  const point=event.target.closest(".guide-progress-point");if(!point||point.classList.contains("is-disabled"))return;
  const stage=Number(point.dataset.stage);if(stage<1||stage>6)return;
  guideSlider.value=String(stage);guideSlider.dispatchEvent(new Event("input",{bubbles:true}));
 });
 guideSlider.addEventListener("input",()=>{
  guideProgress=Math.min(6,Number(guideSlider.value));guideSlider.value=String(guideProgress);selectedVersions.clear();
  try{localStorage.setItem("tranquil-guide-progress",String(guideProgress));}catch(e){}
  renderCards();
 });
 guideSearch.addEventListener("input",applyGuideFilters);
 guideTagOptions.addEventListener("change",event=>{
  if(event.target.matches('input[type="checkbox"]')){
   const allButton=guideTagOptions.querySelector("[data-guide-tag-all]");
   const any=[...guideTagOptions.querySelectorAll('input[type="checkbox"]')].some(input=>input.checked);
   allButton.classList.toggle("is-active",!any);allButton.setAttribute("aria-pressed",String(!any));applyGuideFilters();
  }
 });
 guideTagOptions.addEventListener("click",event=>{
  const allButton=event.target.closest("[data-guide-tag-all]");
  if(!allButton)return;
  guideTagOptions.querySelectorAll('input[type="checkbox"]').forEach(input=>input.checked=false);
  allButton.classList.add("is-active");allButton.setAttribute("aria-pressed","true");applyGuideFilters();
 });
 guideResults.addEventListener("click",event=>{
  const portraitButton=event.target.closest(".guide-portrait-open");
  if(portraitButton){
   const image=portraitButton.querySelector("img");if(!image||image.hidden)return;
   let viewer=document.querySelector(".guide-image-viewer");
   if(!viewer){
    viewer=document.createElement("div");viewer.className="guide-image-viewer";viewer.innerHTML='<button type="button" class="guide-image-viewer-close" aria-label="Закрыть изображение">×</button><img alt="">';
    document.body.append(viewer);
    viewer.addEventListener("click",e=>{if(e.target===viewer||e.target===viewer.querySelector(":scope > img")||e.target.closest(".guide-image-viewer-close"))viewer.classList.remove("is-open");});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")viewer.classList.remove("is-open");});
   }
   const large=viewer.querySelector("img");large.src=image.src;large.alt=image.alt;viewer.classList.add("is-open");return;
  }
  const tab=event.target.closest("[data-guide-version]");if(!tab)return;
  const stage=Number(tab.dataset.guideStage);
  const card=tab.closest("[data-object-id]");
  if(stage>guideProgress){
   const note=card.querySelector(".guide-lock-note");
   note.textContent="Эта версия откроется после чтения: \""+versionLabel(stage)+"\".";
   note.hidden=false;return;
  }
  const objectId=card.dataset.objectId;selectedVersions.set(objectId,tab.dataset.guideVersion);renderCards();
 });
 async function loadGuide(){
  try{
   const response=await fetch("/assets/data/guide/entries.json?v=20261124-guide-data");
   if(!response.ok)throw new Error("Не удалось загрузить файл справочника.");
   const payload=await response.json();
   if(!payload||!Array.isArray(payload.entries))throw new Error("Структура файла справочника некорректна.");
   const byObject=new Map();
   payload.entries.forEach(record=>{
    const key=String(record.objectId);
    if(!byObject.has(key))byObject.set(key,{objectId:record.objectId,records:[]});
    byObject.get(key).records.push(record);
   });
   guideGroups=[...byObject.values()].map(group=>{
    group.records.sort((a,b)=>a.version-b.version);
    group.snapshots=makeSnapshots(group.records);return group;
   });
   renderCards();
  }catch(error){
   guideResults.innerHTML='<div class="guide-empty"><h2>Не удалось загрузить справочник</h2><p>'+escapeGuide(error.message||"Попробуйте обновить страницу позже.")+'</p></div>';
  }
 }
 loadGuide();
}


// Homepage quote generator.
const quoteRoot=document.querySelector(".quote-generator");
if(quoteRoot){
 const quoteText=document.querySelector("#quote-text");
 const quoteSource=document.querySelector("#quote-source");
 const quoteStatus=document.querySelector("#quote-status");
 const imageStatus=document.querySelector("#quote-image-status");
 const bookFilters=document.querySelector("#quote-book-filters");
 const themeFilters=document.querySelector("#quote-theme-filters");
 const imagePanel=document.querySelector("#quote-image-panel");
 const imageCanvas=document.querySelector("#quote-image-canvas");
 const imageContext=imageCanvas?.getContext("2d");
 const authorName="Дмитричев Никита";
 const bookNames=["Порабощение","Артефакт","Золотые крылья"];
 let quoteRecords=[],activeQuote=null,selectedBooks=[],activeTheme="all",lastQuoteId=null,backgroundIndex=0,crestIndex=0,typeTimer=null;
 const crestFiles=["Герб Картрада вектор.png","Герб Анспранда.png","Герб Мармагонии вектор.png","Герб Рупида.png","Герб Родда-Киры вектор.png"];
 const crestImages=crestFiles.map(file=>{const img=new Image();img.src="/assets/images/countries/"+encodeURIComponent(file);return img;});
 crestImages.forEach(img=>img.addEventListener("load",()=>{if(!imagePanel.hidden&&activeQuote)drawQuoteImage();}));
 const imageBackgrounds=[
  ["#0b1718","#245052","#101b22"],["#10151e","#263d5b","#111a2b"],
  ["#102019","#315c45","#101a17"],["#211617","#633b3d","#171113"],
  ["#17191d","#454c50","#111518"],["#171426","#40345d","#111522"],
  ["#17201e","#3d5146","#101815"],["#1b1a13","#554b2c","#17150f"]
 ];
 function availableQuotes(){
  return quoteRecords.filter(item=>{
   const bookMatch=selectedBooks.includes(bookNames.find(name=>String(item.source||"").startsWith('"'+name+'"')));
   const themeMatch=activeTheme==="all"||item.theme===activeTheme;
   return bookMatch&&themeMatch;
  });
 }
 function syncBookFilters(){
  const allSelected=selectedBooks.length===bookNames.length&&bookNames.every(name=>selectedBooks.includes(name));
  const allButton=bookFilters.querySelector('[data-quote-book="all"]');
  allButton.classList.toggle("is-active",allSelected);allButton.setAttribute("aria-pressed",String(allSelected));
  bookFilters.querySelectorAll("[data-quote-book]:not([data-quote-book=all])").forEach(button=>{
   const active=selectedBooks.includes(button.dataset.quoteBook);
   button.classList.toggle("is-active",active);button.setAttribute("aria-pressed",String(active));
  });
 }
 function showQuote(record,animate=true){
  activeQuote=record;lastQuoteId=record.id;
  document.querySelector(".quote-display")?.classList.remove("is-message");
  if(typeTimer)clearInterval(typeTimer);
  const full=String(record.quote||"").trim();
  quoteSource.textContent=record.source||"";
  quoteText.textContent=animate?'"':'"'+full+'"';
  if(!animate)return;
  const words=full.split(/\s+/);let index=0;
  typeTimer=setInterval(()=>{
   quoteText.textContent+=(index?" ":"")+words[index];index++;
   if(index>=words.length){quoteText.textContent+='"';clearInterval(typeTimer);}
  },105);
 }
 function showQuoteMessage(message){
  if(typeTimer)clearInterval(typeTimer);
  activeQuote=null;quoteText.textContent=message;quoteSource.textContent="";
  document.querySelector(".quote-display")?.classList.add("is-message");
  quoteStatus.textContent="";imageStatus.textContent="";imagePanel.hidden=true;
 }
 function pickQuote(){
  if(!selectedBooks.length){showQuoteMessage("Выберите книгу, чтобы увидеть цитаты.");return;}
  const pool=availableQuotes();
  if(!pool.length){showQuoteMessage("Для выбранной комбинации не нашлось подходящих цитат. Выберите больше книг или измените тематику.");return;}
  const choices=pool.length>1?pool.filter(item=>String(item.id)!==String(lastQuoteId)):pool;
  showQuote(choices[Math.floor(Math.random()*choices.length)],true);
  quoteStatus.textContent="";imageStatus.textContent="";imagePanel.hidden=true;
 }
 function wrapLines(ctx,text,maxWidth){
  const words=String(text||"").split(/\s+/);let line="",lines=[];
  words.forEach(word=>{const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;});
  if(line)lines.push(line);return lines;
 }
 function drawQuoteImage(){
  if(!activeQuote||!imageContext)return;
  const ctx=imageContext,w=1080,h=1080,colors=imageBackgrounds[backgroundIndex%imageBackgrounds.length];
  const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,colors[0]);gradient.addColorStop(.52,colors[1]);gradient.addColorStop(1,colors[2]);
  ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  const glow=ctx.createRadialGradient(540,360,30,540,520,700);glow.addColorStop(0,"rgba(255,255,255,.10)");glow.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle="rgba(220,235,230,.28)";ctx.lineWidth=2;ctx.strokeRect(54,54,972,972);
  ctx.strokeStyle="rgba(220,235,230,.16)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(390,150);ctx.lineTo(690,150);ctx.stroke();
  const text='"'+String(activeQuote.quote||"").trim()+'"';
  let fontSize=54;ctx.font="500 "+fontSize+"px 'PT Sans', Arial, sans-serif";
  let lines=wrapLines(ctx,text,820);
  while(lines.length>11&&fontSize>34){fontSize-=2;ctx.font="500 "+fontSize+"px 'PT Sans', Arial, sans-serif";lines=wrapLines(ctx,text,820);}
  const lineHeight=fontSize*1.42,quoteHeight=lines.length*lineHeight,quoteTop=480-quoteHeight/2;
  ctx.fillStyle="#f0f3ef";ctx.font="500 "+fontSize+"px 'PT Sans', Arial, sans-serif";ctx.textAlign="center";ctx.textBaseline="top";
  lines.forEach((part,index)=>ctx.fillText(part,540,quoteTop+index*lineHeight));
  const metaY=Math.min(quoteTop+quoteHeight+180,790);
  ctx.save();ctx.shadowColor="rgba(0,0,0,.48)";ctx.shadowBlur=9;ctx.shadowOffsetY=3;
  ctx.fillStyle="rgba(225,239,231,.9)";ctx.font="700 25px 'PT Sans', Arial, sans-serif";ctx.fillText(authorName,540,metaY);ctx.restore();
  const source=String(activeQuote.source||"");
  const match=source.match(/^(".*?"): ?(.*)$/);
  const bookLine=match?match[1]:source;
  const chapterLine=match?match[2]:"";
  ctx.fillStyle="rgba(225,239,231,.68)";ctx.font="400 21px 'PT Sans', Arial, sans-serif";
  ctx.fillText(bookLine,540,metaY+43);
  if(chapterLine)ctx.fillText(chapterLine,540,metaY+73);
  const crest=crestImages[crestIndex];
  if(crest?.complete&&crest.naturalWidth){
   ctx.save();ctx.shadowColor="rgba(0,0,0,.55)";ctx.shadowBlur=12;ctx.shadowOffsetY=4;
   const maxW=53,maxH=70,scale=Math.min(maxW/crest.naturalWidth,maxH/crest.naturalHeight);
   const crestW=crest.naturalWidth*scale,crestH=crest.naturalHeight*scale;
   ctx.drawImage(crest,82,949-crestH/2,crestW,crestH);ctx.restore();
  }
  ctx.save();ctx.textAlign="left";ctx.textBaseline="alphabetic";
  ctx.shadowColor="rgba(0,0,0,.58)";ctx.shadowBlur=9;ctx.shadowOffsetY=3;
  ctx.fillStyle="#f0f3ef";ctx.font="600 35px 'Yanone Kaffeesatz', Arial, sans-serif";ctx.fillText("Транквильский",148,946);
  ctx.fillStyle="#a5d4d1";ctx.font="600 29px 'Yanone Kaffeesatz', Arial, sans-serif";ctx.fillText("вестник",148,978);ctx.restore();
 }
 function copyQuote(){
  if(!activeQuote)return;
  const text='"'+String(activeQuote.quote||"").trim()+'"\n'+authorName+" "+String(activeQuote.source||"");
  navigator.clipboard?.writeText(text).then(()=>{quoteStatus.textContent="Цитата скопирована.";}).catch(()=>{quoteStatus.textContent="Не удалось скопировать автоматически.";});
 }
 bookFilters?.addEventListener("click",event=>{
  const button=event.target.closest("[data-quote-book]");if(!button)return;
  const book=button.dataset.quoteBook;
  if(book==="all"){
   if(selectedBooks.length===bookNames.length)selectedBooks=[];
   else selectedBooks=[...bookNames];
  }else{
   if(selectedBooks.includes(book))selectedBooks=selectedBooks.filter(name=>name!==book);
   else selectedBooks.push(book);
  }
  syncBookFilters();lastQuoteId=null;pickQuote();
 });
 themeFilters?.addEventListener("click",event=>{
  const button=event.target.closest("[data-quote-theme]");if(!button)return;
  activeTheme=button.dataset.quoteTheme;
  themeFilters.querySelectorAll("[data-quote-theme]").forEach(item=>{
   const active=item===button;item.classList.toggle("is-active",active);item.setAttribute("aria-pressed",String(active));
  });
  lastQuoteId=null;pickQuote();
 });
 document.querySelector("#new-quote")?.addEventListener("click",pickQuote);
 document.querySelector("#copy-quote")?.addEventListener("click",copyQuote);
 document.querySelector("#make-quote-image")?.addEventListener("click",()=>{
  if(!activeQuote)return;imagePanel.hidden=false;drawQuoteImage();imagePanel.scrollIntoView({behavior:"smooth",block:"nearest"});
 });
 document.querySelector("#quote-image-background")?.addEventListener("click",()=>{backgroundIndex=(backgroundIndex+1)%imageBackgrounds.length;drawQuoteImage();});
 document.querySelector("#quote-image-crest")?.addEventListener("click",()=>{crestIndex=(crestIndex+1)%crestImages.length;drawQuoteImage();});
 document.querySelector("#quote-image-download")?.addEventListener("click",()=>{
  if(!activeQuote)return;const link=document.createElement("a");link.download="tsitata-"+activeQuote.id+".png";link.href=imageCanvas.toDataURL("image/png");link.click();
 });
 document.querySelector("#quote-image-copy")?.addEventListener("click",async()=>{
  if(!activeQuote||!navigator.clipboard||!window.ClipboardItem){imageStatus.textContent="Копирование изображения не поддерживается этим браузером.";return;}
  try{const blob=await new Promise(resolve=>imageCanvas.toBlob(resolve,"image/png"));await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);imageStatus.textContent="Изображение скопировано.";}
  catch(error){imageStatus.textContent="Не удалось скопировать изображение.";}
 });
 syncBookFilters();
 fetch("/assets/data/quotes.json?v=20261125-test-pool-3").then(response=>{if(!response.ok)throw new Error("Не удалось загрузить цитаты.");return response.json();}).then(payload=>{
  if(!Array.isArray(payload.quotes))throw new Error("Файл цитат имеет неверный формат.");
  quoteRecords=payload.quotes;pickQuote();
 }).catch(error=>{quoteStatus.textContent=error.message||"Не удалось загрузить цитаты.";});
}
