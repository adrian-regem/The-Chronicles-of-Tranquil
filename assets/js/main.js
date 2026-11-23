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


// Interactive map: switch periods, zoom and drag to pan.
const mapImage=document.querySelector("#period-map-image"), mapViewport=document.querySelector("#map-viewport");
const mapZoom=document.querySelector("#map-zoom"), mapZoomValue=document.querySelector("#map-zoom-value");
const mapZoomReset=document.querySelector("#map-zoom-reset"), mapCaption=document.querySelector("#map-caption");
const mapImageError=document.querySelector("#map-image-error");
let mapScale=1,mapX=0,mapY=0,mapDrag=null;
function renderMap(){if(!mapImage)return;mapImage.style.transform=`translate(${mapX}px,${mapY}px) scale(${mapScale})`;if(mapZoom)mapZoom.value=String(mapScale);if(mapZoomValue)mapZoomValue.textContent=Math.round(mapScale*100)+"%";}
function resetMap(){mapScale=1;mapX=0;mapY=0;renderMap();}
document.querySelectorAll("[data-map-period]").forEach(button=>button.addEventListener("click",()=>{
 const artifact=button.dataset.mapPeriod==="artifact",title=artifact?"Артефакт":"Порабощение";
 document.querySelectorAll("[data-map-period]").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});
 if(mapImage){mapImageError.hidden=true;mapImage.src=artifact?"/assets/images/maps/Транквил%20(1).png":"/assets/images/maps/Транквил.png";mapImage.alt="Карта Транквила периода «"+title+"»";mapCaption.textContent="Транквиль — период «"+title+"»";resetMap();}
}));
if(mapImage){mapImage.addEventListener("error",()=>{if(mapImageError)mapImageError.hidden=false;});mapImage.addEventListener("load",()=>{if(mapImageError)mapImageError.hidden=true;});}
mapZoom?.addEventListener("input",()=>{mapScale=Number(mapZoom.value);renderMap();});
mapZoomReset?.addEventListener("click",resetMap);
mapViewport?.addEventListener("wheel",e=>{e.preventDefault();mapScale=Math.max(1,Math.min(4,mapScale+(e.deltaY<0?.15:-.15)));renderMap();},{passive:false});
mapViewport?.addEventListener("pointerdown",e=>{if(e.target.closest(".map-zoom-controls"))return;mapDrag={id:e.pointerId,x:e.clientX,y:e.clientY,ox:mapX,oy:mapY};mapViewport.setPointerCapture(e.pointerId);mapViewport.classList.add("is-dragging");});
mapViewport?.addEventListener("pointermove",e=>{if(!mapDrag||mapDrag.id!==e.pointerId)return;mapX=mapDrag.ox+e.clientX-mapDrag.x;mapY=mapDrag.oy+e.clientY-mapDrag.y;renderMap();});
function stopMapDrag(e){if(!mapDrag||(e&&mapDrag.id!==e.pointerId))return;mapDrag=null;mapViewport?.classList.remove("is-dragging");}
mapViewport?.addEventListener("pointerup",stopMapDrag);mapViewport?.addEventListener("pointercancel",stopMapDrag);

// Expandable book cards. The selected cover grows; the synopsis slides in beside it.
const bookSelector=document.querySelector("#book-selector"),bookDetails=document.querySelector("#book-details");
const bookData={
 enslavement:{title:"Порабощение",eyebrow:"Книга первая",synopsis:"Синопсис первой книги появится здесь. Это место предназначено для краткого знакомства с завязкой истории, её героями и главным конфликтом — без раскрытия ключевых поворотов.",status:"Описание и ссылки готовятся",links:["Печатное издание — скоро","Электронная версия — скоро"]},
 artifact:{title:"Артефакт",eyebrow:"Книга вторая",synopsis:"Синопсис второй книги появится здесь. В этом блоке будет краткое описание сюжета и его связи с первой частью цикла.",status:"Описание и ссылки готовятся",links:["Печатное издание — скоро","Электронная версия — скоро"]},
 third:{title:"Третья книга",eyebrow:"Книга третья",synopsis:"Название, аннотация и подробности третьей книги будут опубликованы позднее.",status:"Название пока не объявлено",links:["Информация о публикации появится позже"]}
};
bookSelector?.querySelectorAll(".book-choice").forEach(button=>button.addEventListener("click",()=>{
 const active=button.classList.contains("is-active");
 bookSelector.querySelectorAll(".book-choice").forEach(item=>{item.classList.remove("is-active");item.setAttribute("aria-expanded","false");item.style.gridRow="";});
 if(active){bookSelector.classList.remove("is-expanded");bookDetails.hidden=true;return;}
 const data=bookData[button.dataset.book],all=[...bookSelector.querySelectorAll(".book-choice")],idx=all.indexOf(button);
 all.forEach((item,i)=>item.style.gridRow=String(i+1));button.classList.add("is-active");button.setAttribute("aria-expanded","true");
 bookSelector.classList.add("is-expanded");bookDetails.style.gridRow=String(idx+1);
 bookDetails.innerHTML='<p class="eyebrow">'+data.eyebrow+'</p><h3>'+data.title+'</h3><p class="book-synopsis">'+data.synopsis+'</p><p class="book-detail-status">'+data.status+'</p><div class="book-detail-links">'+data.links.map(x=>'<span>'+x+'</span>').join("")+'</div>';
 bookDetails.hidden=false;
}));
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
