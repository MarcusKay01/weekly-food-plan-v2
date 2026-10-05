const STYLE_ID='mealStatusUiStyle';
function addStyle(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
.meal.skipped{opacity:.56!important;position:relative!important}
.meal.skipped .title{text-decoration:line-through!important;text-decoration-thickness:1.5px!important}
.meal-status-badge{display:inline-flex;align-items:center;margin-top:6px;padding:3px 8px;border-radius:999px;font:800 .61rem/1.2 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.meal-status-badge.skipped{background:rgba(181,82,58,.12);color:#8B3F31;border:1px solid rgba(181,82,58,.18)}
.meal.skipped .complete{opacity:.35!important}
`;document.head.appendChild(s)}
function apply(){addStyle();document.querySelectorAll('.meal[data-meal]').forEach(meal=>{meal.classList.remove('skipped');meal.querySelectorAll('.meal-status-badge').forEach(x=>x.remove());const menu=[...meal.querySelectorAll('.menu-pop button')].map(x=>x.textContent.trim().toLowerCase());const skipped=menu.includes('reopen')&&!meal.classList.contains('done');if(!skipped)return;meal.classList.add('skipped');const copy=meal.querySelector('.meal-copy');if(copy){const badge=document.createElement('span');badge.className='meal-status-badge skipped';badge.textContent='Skipped';copy.appendChild(badge)}})}
let queued=false;function run(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
function start(){run();const week=document.getElementById('week');if(week)new MutationObserver(run).observe(week,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
