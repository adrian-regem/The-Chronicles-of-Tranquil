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
 mapBaseWidth=mapViewport.clientWidth;
 mapBaseHeight=mapBaseWidth*mapImage.naturalHeight/mapImage.naturalWidth;
 mapViewport.style.height=mapBaseHeight+"px";
 mapTrack.style.width=(mapBaseWidth*3)+"px";
 mapTrack.style.height=mapBaseHeight+"px";
 mapCopies.forEach(img=>{img.style.width=mapBaseWidth+"px";img.style.height=mapBaseHeight+"px";});
 mapX=-mapBaseWidth;
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
 mapScale=1;mapY=0;resetMap();
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
   {format:"Бумажная версия",items:[
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
 return '<div class="book-store-groups">'+stores.map(group=>'<section class="book-store-group"><h4>'+group.format+'</h4><div class="book-store-list">'+group.items.map(store=>'<a class="book-store-link" href="'+store.url+'" target="_blank" rel="noopener noreferrer" aria-label="'+group.format+': '+store.brand+'" title="'+store.brand+' — '+group.format+'"><span class="book-store-mark book-store-'+store.brand.toLowerCase().replace(/[^a-zа-яё]/g,"")+'">'+store.mark+'</span><span class="book-store-name">'+store.brand+'</span></a>').join("")+'</div></section>').join("")+'</div>';
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
  let nextRow=2;all.forEach(item=>{item.style.gridRow=item===button?"1":String(nextRow++);});
  button.classList.add("is-active");button.setAttribute("aria-expanded","true");
  selector.classList.add("is-expanded");details.hidden=false;details.style.gridRow="1";
  const relatedBooks=data.forBooks||(data.forBook?[data.forBook]:[]);
  const forExtra=relatedBooks.length?'<div class="book-for-row"><span class="book-for-label">'+(data.relationLabel||"Для книг:")+'</span>'+relatedBooks.map(book=>makeBookLink(book.id,book.title,book.cover,"book-for-link")).join("")+'</div>':"";
  let extra="";
  if(data.previous||data.next){
   extra+='<div class="book-cycle-nav">';
   if(data.previous){const p=bookData[data.previous];extra+='<div class="book-cycle-item"><span class="book-cycle-label">Предыдущая книга цикла</span>'+makeBookLink(data.previous,p.title,p.cover||"Ⅰ","book-cycle-link")+'</div>';}
   if(data.next){const n=bookData[data.next];extra+='<div class="book-cycle-item"><span class="book-cycle-label">Следующая книга цикла</span>'+makeBookLink(data.next,n.title,n.cover||"Ⅱ","book-cycle-link")+'</div>';}
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
// Dictionary filters work with entries carrying data-guide-entry, data-type and data-spoiler.
const guideSearch = document.querySelector("#guide-search");
const guideSpoilers = document.querySelector("#guide-spoilers");
const guideType = document.querySelector("#guide-type");
const guideResults = document.querySelector("#guide-results");

function filterGuideEntries() {
  if (!guideResults) return;
  const entries = [...guideResults.querySelectorAll("[data-guide-entry]")];
  const query = (guideSearch?.value || "").trim().toLocaleLowerCase("ru");
  const maxSpoiler = Number(guideSpoilers?.value || 0);
  const type = guideType?.value || "all";
  let shown = 0;
  entries.forEach((entry) => {
    const searchable = (entry.dataset.search || entry.textContent).toLocaleLowerCase("ru");
    const spoiler = Number(entry.dataset.spoiler || 0);
    const matches = (!query || searchable.includes(query)) &&
      spoiler <= maxSpoiler &&
      (type === "all" || entry.dataset.type === type);
    entry.hidden = !matches;
    if (matches) shown++;
  });
  const empty = guideResults.querySelector(".guide-empty");
  if (empty) empty.hidden = entries.length > 0 && shown > 0;
  const noMatches = guideResults.querySelector(".guide-no-matches");
  if (entries.length > 0 && shown === 0 && !noMatches) {
    const message = document.createElement("p");
    message.className = "guide-no-matches";
    message.textContent = "По заданным условиям ничего не найдено.";
    guideResults.append(message);
  } else if (noMatches) {
    noMatches.hidden = shown > 0;
  }
}
[guideSearch, guideSpoilers, guideType].forEach((control) => {
  control?.addEventListener("input", filterGuideEntries);
  control?.addEventListener("change", filterGuideEntries);
});
filterGuideEntries();
