const HERO='https://images.unsplash.com/photo-1757878082430-46aa38960b06?auto=format&fit=crop&q=82&w=1400';

function enhanceHero(){
 const hero=document.querySelector('.hero'); if(!hero||hero.dataset.rich)return;
 hero.dataset.rich='1'; hero.style.setProperty('--hero-image',`url("${HERO}")`);
 hero.innerHTML='<div class="hero-kicker">LA TAVOLA DI CASA</div><h1>Weekly<br><em>Food Plan</em></h1><p>Good food, thoughtfully planned.</p>';
}
function enhanceNav(){
 const nav=document.querySelector('#main nav'); if(!nav||nav.querySelector('#moreTab'))return;
 const more=document.createElement('button'); more.id='moreTab'; more.innerHTML='<span class="nav-icon">☰</span><span>More</span>'; more.onclick=()=>alert('Budget, Home and family settings are coming here next.'); nav.appendChild(more);
 document.getElementById('weekTab').innerHTML='<span class="nav-icon">⌂</span><span>Week</span>';
 document.getElementById('shopTab').innerHTML='<span class="nav-icon">⌑</span><span>Shop</span>';
}
function dayParts(day){const d=new Date(day.dataset.date+'T12:00');return{dow:d.toLocaleDateString('en-GB',{weekday:'short'}).toUpperCase(),num:d.getDate()}}
function buildDayStrip(){
 const week=document.getElementById('week'); if(!week)return;
 const days=[...week.querySelectorAll('.day')]; if(!days.length)return;
 let strip=document.getElementById('dayStrip');
 if(!strip){strip=document.createElement('div');strip.id='dayStrip';strip.className='day-strip';week.before(strip)}
 const today=new Date().toISOString().slice(0,10);
 strip.innerHTML=days.map(day=>{const p=dayParts(day);return `<button class="day-chip ${day.dataset.date===today?'active':''}" data-jump="${day.dataset.date}"><span>${p.dow}</span><b>${p.num}</b></button>`}).join('');
 strip.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>document.querySelector(`.day[data-date="${b.dataset.jump}"]`)?.scrollIntoView({behavior:'smooth',block:'start'}));
}
function enhanceMeals(){
 document.querySelectorAll('.day').forEach(day=>{
  const h=day.querySelector('h3'); if(h&&!h.dataset.editorial){h.dataset.editorial='1';const d=new Date(day.dataset.date+'T12:00');h.innerHTML=`<span>${d.toLocaleDateString('en-GB',{weekday:'long'})}</span><em>${d.toLocaleDateString('en-GB',{day:'numeric',month:'long'})}</em>`}
  day.querySelectorAll('.meal').forEach(meal=>{
   meal.querySelector('.meal-visual')?.remove();
   const hint=meal.querySelector('.drag-hint'); if(hint)hint.textContent='Move meal';
  });
 });
}
function enhanceWeekNav(){const w=document.querySelector('.weeknav');if(!w||w.dataset.compact)return;w.dataset.compact='1';const p=document.getElementById('period');if(p)p.insertAdjacentHTML('beforebegin','<span class="week-label">THIS WEEK</span>')}
function enhance(){enhanceHero();enhanceNav();enhanceWeekNav();buildDayStrip();enhanceMeals()}
const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
function start(){enhance();const week=document.getElementById('week');if(week)observer.observe(week,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();