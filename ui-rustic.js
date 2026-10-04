function applyCanonicalArtwork(){
 if(document.getElementById('rusticArtworkVars'))return;
 const link=document.createElement('link');link.id='rusticArtworkVars';link.rel='stylesheet';link.href='./assets/rustic-background-reference.css?v=29d5c8fa';document.head.appendChild(link);
 const style=document.createElement('style');style.textContent=`body{background-color:#F6EFE4!important;background-image:var(--rustic-art)!important;background-size:cover!important;background-position:top center!important;background-attachment:fixed!important;background-repeat:no-repeat!important}.app{background:rgba(246,239,228,.12)!important;min-height:100vh}.top-tabs{background:rgba(246,239,228,.76)!important;backdrop-filter:blur(3px)}.day-strip{background:rgba(246,239,228,.12)!important}.meal{background:rgba(246,239,228,.28)!important}nav{background:rgba(246,239,228,.90)!important;backdrop-filter:blur(10px)}`;document.head.appendChild(style);
}
function enhanceHero(){
 const hero=document.querySelector('.hero'); if(!hero||hero.dataset.rich)return;
 hero.dataset.rich='1';
 hero.innerHTML='<div class="hero-kicker">LA TAVOLA DI CASA</div><h1>Weekly<br><em>Food Plan</em></h1><p>Simple meals for a healthier, happier family.</p>';
}
function setView(view){
 const week=document.getElementById('week'),shop=document.getElementById('shop');
 if(!week||!shop)return;
 const isWeek=view==='week';week.classList.toggle('hidden',!isWeek);shop.classList.toggle('hidden',isWeek);
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 document.getElementById('weekTab')?.classList.toggle('primary',isWeek);document.getElementById('shopTab')?.classList.toggle('primary',!isWeek);
}
function enhanceTopTabs(){
 const main=document.getElementById('main'),weeknav=main?.querySelector('.weeknav');if(!main||!weeknav||document.getElementById('topTabs'))return;
 const tabs=document.createElement('div');tabs.id='topTabs';tabs.className='top-tabs';tabs.innerHTML='<button class="active" data-view="week">Week</button><button data-view="shop">Shop</button><button id="topMore">More</button>';weeknav.before(tabs);
 tabs.querySelector('[data-view="week"]').onclick=()=>setView('week');tabs.querySelector('[data-view="shop"]').onclick=()=>setView('shop');tabs.querySelector('#topMore').onclick=()=>alert('Budget, Home and family settings are coming here next.');
}
function enhanceNav(){
 const nav=document.querySelector('#main nav'); if(!nav)return;
 if(!nav.querySelector('#moreTab')){const more=document.createElement('button');more.id='moreTab';more.innerHTML='<span class="nav-icon">☰</span><span>More</span>';more.onclick=()=>alert('Budget, Home and family settings are coming here next.');nav.appendChild(more)}
 const week=document.getElementById('weekTab'),shop=document.getElementById('shopTab');if(week){week.innerHTML='<span class="nav-icon">⌂</span><span>Week</span>';week.onclick=()=>setView('week')}if(shop){shop.innerHTML='<span class="nav-icon">⌑</span><span>Shop</span>';shop.onclick=()=>setView('shop')}
}
function dayParts(day){const d=new Date(day.dataset.date+'T12:00');return{dow:d.toLocaleDateString('en-GB',{weekday:'short'}).toUpperCase(),num:d.getDate()}}
function buildDayStrip(){
 const week=document.getElementById('week'); if(!week)return;const days=[...week.querySelectorAll('.day')]; if(!days.length)return;
 let strip=document.getElementById('dayStrip');if(!strip){strip=document.createElement('div');strip.id='dayStrip';strip.className='day-strip';week.before(strip)}
 const today=new Date().toISOString().slice(0,10);strip.innerHTML=days.map((day,i)=>{const p=dayParts(day);return `<button class="day-chip ${day.dataset.date===today||(!days.some(x=>x.dataset.date===today)&&i===0)?'active':''}" data-jump="${day.dataset.date}"><span>${p.dow}</span><b>${p.num}</b></button>`}).join('');
 strip.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{strip.querySelectorAll('.day-chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector(`.day[data-date="${b.dataset.jump}"]`)?.scrollIntoView({behavior:'smooth',block:'start'})});
}
function enhanceMeals(){document.querySelectorAll('.day').forEach(day=>{const h=day.querySelector('h3');if(h&&!h.dataset.editorial){h.dataset.editorial='1';const d=new Date(day.dataset.date+'T12:00');h.innerHTML=`<span>${d.toLocaleDateString('en-GB',{weekday:'long'})}</span><em>${d.toLocaleDateString('en-GB',{day:'numeric',month:'long'})}</em>`}day.querySelectorAll('.meal').forEach(meal=>{meal.querySelector('.meal-visual')?.remove();const hint=meal.querySelector('.drag-hint');if(hint)hint.textContent='Move meal'})})}
function enhance(){applyCanonicalArtwork();enhanceHero();enhanceTopTabs();enhanceNav();buildDayStrip();enhanceMeals()}
const observer=new MutationObserver(()=>requestAnimationFrame(enhance));function start(){enhance();const week=document.getElementById('week');if(week)observer.observe(week,{childList:true,subtree:true})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();