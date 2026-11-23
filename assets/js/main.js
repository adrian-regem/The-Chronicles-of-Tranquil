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


// Sticky header: show the active top-level section after leaving the page banner.
const siteHeader=document.querySelector(".site-header");
if(siteHeader){
 const activeNav=siteHeader.querySelector(".main-nav a.active");
 if(activeNav){
  const sectionLabel=document.createElement("span");
  sectionLabel.className="header-section-title";
  sectionLabel.textContent=activeNav.textContent.trim();
  sectionLabel.setAttribute("aria-hidden","true");
  siteHeader.append(sectionLabel);
 }
 const updateHeader=()=>siteHeader.classList.toggle("is-scrolled",window.scrollY>130);
 window.addEventListener("scroll",updateHeader,{passive:true});updateHeader();
}

// Interactive map: wheel scrolls the page; desktop drag and two-finger touch move the map.
const mapImage=document.querySelector("#period-map-image"),mapViewport=document.querySelector("#map-viewport");
const mapZoom=document.querySelector("#map-zoom"),mapZoomValue=document.querySelector("#map-zoom-value");
const mapZoomReset=document.querySelector("#map-zoom-reset"),mapComingSoon=document.querySelector("#map-coming-soon");
const mapZoomControls=document.querySelector(".map-zoom-controls"),mapPanHint=document.querySelector(".map-pan-hint");
let mapScale=1,mapX=0,mapY=0,mapDrag=null,touchPan=null,touchScrollY=null;
function renderMap(){
 if(!mapImage)return;
 mapImage.style.transform=`translate(${mapX}px,${mapY}px) scale(${mapScale})`;
 if(mapZoom)mapZoom.value=String(mapScale);
 if(mapZoomValue)mapZoomValue.textContent=Math.round(mapScale*100)+"%";
}
function resetMap(){mapScale=1;mapX=0;mapY=0;renderMap();}
document.querySelectorAll("[data-map-period]").forEach(button=>button.addEventListener("click",()=>{
 const period=button.dataset.mapPeriod,unknown=period==="unknown";
 const title=period==="artifact"?"Артефакт":"Порабощение";
 document.querySelectorAll("[data-map-period]").forEach(item=>{
  const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));
 });
 if(!mapImage)return;
 if(unknown){
  mapImage.hidden=true;mapComingSoon.hidden=false;mapZoomControls.hidden=true;if(mapPanHint)mapPanHint.hidden=true;
 }else{
  mapImage.hidden=false;mapComingSoon.hidden=true;mapZoomControls.hidden=false;if(mapPanHint)mapPanHint.hidden=false;
  mapImage.src=period==="artifact"?"/assets/images/maps/Транквил%20(1).png":"/assets/images/maps/Транквил.png";
  mapImage.alt="Карта мира — период «"+title+"»";
 }
 resetMap();
}));
mapImage?.addEventListener("error",()=>{const err=document.querySelector("#map-image-error");if(err)err.hidden=false;});
mapImage?.addEventListener("load",()=>{const err=document.querySelector("#map-image-error");if(err)err.hidden=true;});
mapZoom?.addEventListener("input",()=>{mapScale=Number(mapZoom.value);renderMap();});
mapZoomReset?.addEventListener("click",resetMap);
mapViewport?.addEventListener("pointerdown",e=>{
 if(e.pointerType==="touch"||e.target.closest(".map-zoom-controls")||mapImage?.hidden)return;
 mapDrag={id:e.pointerId,x:e.clientX,y:e.clientY,ox:mapX,oy:mapY};
 mapViewport.setPointerCapture(e.pointerId);mapViewport.classList.add("is-dragging");
});
mapViewport?.addEventListener("pointermove",e=>{
 if(!mapDrag||mapDrag.id!==e.pointerId)return;
 mapX=mapDrag.ox+e.clientX-mapDrag.x;mapY=mapDrag.oy+e.clientY-mapDrag.y;renderMap();
});
function stopMapDrag(e){if(!mapDrag||(e&&mapDrag.id!==e.pointerId))return;mapDrag=null;mapViewport?.classList.remove("is-dragging");}
mapViewport?.addEventListener("pointerup",stopMapDrag);mapViewport?.addEventListener("pointercancel",stopMapDrag);
mapViewport?.addEventListener("touchstart",e=>{
 if(mapImage?.hidden)return;
 if(e.touches.length===2){
  e.preventDefault();touchScrollY=null;
  const mid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,y:(e.touches[0].clientY+e.touches[1].clientY)/2};
  touchPan={x:mid.x,y:mid.y,ox:mapX,oy:mapY};
 }else if(e.touches.length===1){touchPan=null;touchScrollY=e.touches[0].clientY;}
},{passive:false});
mapViewport?.addEventListener("touchmove",e=>{
 if(e.touches.length===2&&touchPan){
  e.preventDefault();
  const mid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,y:(e.touches[0].clientY+e.touches[1].clientY)/2};
  mapX=touchPan.ox+mid.x-touchPan.x;mapY=touchPan.oy+mid.y-touchPan.y;renderMap();
 }else if(e.touches.length===1&&touchScrollY!==null){
  e.preventDefault();
  const nextY=e.touches[0].clientY;window.scrollBy(0,touchScrollY-nextY);touchScrollY=nextY;
 }
},{passive:false});
mapViewport?.addEventListener("touchend",e=>{
 if(e.touches.length<2)touchPan=null;
 if(e.touches.length===0)touchScrollY=null;
 else if(e.touches.length===1)touchScrollY=e.touches[0].clientY;
},{passive:true});
mapViewport?.addEventListener("touchcancel",()=>{touchPan=null;touchScrollY=null;},{passive:true});

// Expandable catalogs: each section has its own single-open selection.
const bookData={
 enslavement:{title:"Порабощение",cover:"Ⅰ",eyebrow:"Книга первая",synopsis:"Синопсис первой книги появится здесь. Это место предназначено для краткого знакомства с завязкой истории, её героями и главным конфликтом — без раскрытия ключевых поворотов.",status:"Описание и ссылки готовятся",links:["Печатное издание — скоро","Электронная версия — скоро"],next:"artifact"},
 artifact:{title:"Артефакт",cover:"Ⅱ",eyebrow:"Книга вторая",synopsis:"Синопсис второй книги появится здесь. В этом блоке будет краткое описание сюжета и его связи с первой частью цикла.",status:"Описание и ссылки готовятся",links:["Печатное издание — скоро","Электронная версия — скоро"],previous:"enslavement",next:"third"},
 third:{title:"Третья книга",cover:"Ⅲ",eyebrow:"Книга третья",synopsis:"Название, аннотация и подробности третьей книги будут опубликованы позднее.",status:"Название пока не объявлено",links:["Информация о публикации появится позже"],previous:"artifact"},
 "golden-wings":{title:"Золотые крылья",eyebrow:"Спин-офф к: Артефакт",synopsis:"Здесь появятся описание, синопсис и сведения о повести «Золотые крылья».",status:"Информация готовится",links:["Печатное издание — скоро","Электронная версия — скоро"]},
 "guide-enslavement":{title:"Путеводитель по Порабощению",eyebrow:"Справочник",synopsis:"Справочник поможет ориентироваться в событиях, персонажах, местах и понятиях первой книги цикла.",status:"Справочник готовится",links:["Открыть справочник — скоро"],forBook:{id:"enslavement",title:"Хроники Транквила: Порабощение",cover:"Ⅰ"}},
 "guide-artifact":{title:"Путеводитель по Артефакту",eyebrow:"Справочник",synopsis:"Справочник соберёт сведения о персонажах, местах и важных понятиях второй книги цикла.",status:"Справочник готовится",links:["Открыть справочник — скоро"],forBook:{id:"artifact",title:"Хроники Транквила: Артефакт",cover:"Ⅱ"}},
 "guide-unknown":{title:"Неизвестный справочник",eyebrow:"Справочник",synopsis:"Название и содержание третьего справочника будут объявлены позднее.",status:"Информация появится позже",links:["Подробности будут опубликованы позднее"],forBook:{id:"third",title:"Хроники Транквила: ???",cover:"Ⅲ"}}
};
function makeBookLink(id,label,cover,klass){
 return '<button type="button" class="'+klass+'" data-open-book="'+id+'"><span class="book-mini-cover" aria-hidden="true">'+cover+'</span><span>'+label+'</span></button>';
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
document.querySelectorAll("[data-book-selector]").forEach(selector=>{
 const details=selector.querySelector(".book-details");
 selector.querySelectorAll(".book-choice").forEach(button=>button.addEventListener("click",()=>{
  const active=button.classList.contains("is-active");
  selector.querySelectorAll(".book-choice").forEach(item=>{
   item.classList.remove("is-active");item.setAttribute("aria-expanded","false");item.style.gridRow="";
  });
  if(active){selector.classList.remove("is-expanded");details.hidden=true;return;}
  const data=bookData[button.dataset.book],all=[...selector.querySelectorAll(".book-choice")],idx=all.indexOf(button);
  all.forEach((item,i)=>item.style.gridRow=String(i+1));
  button.classList.add("is-active");button.setAttribute("aria-expanded","true");
  selector.classList.add("is-expanded");details.style.gridRow=String(idx+1);
  let extra="",forExtra="";
  if(data.forBook)forExtra='<div class="book-for-row"><span class="book-for-label">Для книг:</span>'+makeBookLink(data.forBook.id,data.forBook.title,data.forBook.cover,"book-for-link")+'</div>';
  if(data.previous||data.next){
   extra+='<div class="book-cycle-nav">';
   if(data.previous){const p=bookData[data.previous];extra+='<div class="book-cycle-item"><span class="book-cycle-label">Предыдущая книга цикла</span>'+makeBookLink(data.previous,p.title,p.cover||"Ⅰ","book-cycle-link")+'</div>';}
   if(data.next){const n=bookData[data.next];extra+='<div class="book-cycle-item"><span class="book-cycle-label">Следующая книга цикла</span>'+makeBookLink(data.next,n.title,n.cover||"Ⅱ","book-cycle-link")+'</div>';}
   extra+='</div>';
  }
  details.innerHTML='<p class="eyebrow">'+data.eyebrow+'</p><h3>'+data.title+'</h3>'+forExtra+'<p class="book-synopsis">'+data.synopsis+'</p><p class="book-detail-status">'+data.status+'</p><div class="book-detail-links">'+data.links.map(x=>'<span>'+x+'</span>').join("")+'</div>'+extra;
  details.hidden=false;
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
