import Sortable from 'https://esm.sh/sortablejs@1.15.6';

const PROJECT_REF='tskihefmcsqcdvjvzdwm';
const AUTH_KEY=`sb-${PROJECT_REF}-auth-token`;
let busy=false;
const sortables=new WeakMap();

function sessionToken(){
  try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')?.access_token||null}catch{return null}
}
function mealType(meal){return meal?.querySelector('.muted')?.textContent?.trim().toLowerCase()||''}
function isDinner(meal){return mealType(meal).startsWith('dinner')&&!meal.classList.contains('done')}
function ensureGrip(meal){
  meal.dataset.draggable='true';
  let grip=meal.querySelector('.drag-grip');
  if(!grip){grip=document.createElement('span');grip.className='drag-grip';grip.textContent='⠿';meal.querySelector('.row')?.appendChild(grip)}
  grip.setAttribute('role','button');grip.setAttribute('aria-label','Move dinner to another day');grip.title='Move dinner';
  Object.assign(grip.style,{display:'grid',placeItems:'center',width:'40px',height:'44px',minWidth:'40px',marginLeft:'2px',borderRadius:'12px',color:'#1F4B3F',fontSize:'23px',lineHeight:'1',cursor:'grab',touchAction:'none',userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none'});
}
async function persistMove(id,targetDate){
  const token=sessionToken();if(!token)throw new Error('Your session expired. Please sign in again.');
  const r=await fetch('https://tskihefmcsqcdvjvzdwm.supabase.co/rest/v1/rpc/move_meal',{method:'POST',headers:{'Content-Type':'application/json','apikey':'sb_publishable_AL_R6WjOMKyeWltHOth9yg_pGLg3rWD','Authorization':`Bearer ${token}`},body:JSON.stringify({target_meal_id:id,target_date:targetDate})});
  if(!r.ok){let msg='Meal could not be moved.';try{const j=await r.json();msg=j.message||msg}catch{}throw new Error(msg)}
}
function prepareMeals(){
  document.querySelectorAll('.day-drag-handle,.day-pair-handle').forEach(x=>x.remove());
  document.querySelectorAll('.meal[data-meal]').forEach(meal=>{if(isDinner(meal))ensureGrip(meal);else{delete meal.dataset.draggable;meal.querySelector('.drag-grip')?.remove()}});
}
function initDay(day){
  if(sortables.has(day))return;
  const sortable=Sortable.create(day,{group:'dinner-days',draggable:'.meal[data-draggable="true"]',handle:'.drag-grip',animation:170,forceFallback:true,fallbackOnBody:true,fallbackTolerance:4,touchStartThreshold:4,chosenClass:'drag-source',ghostClass:'drag-ghost',dragClass:'dragging',scroll:true,scrollSensitivity:80,scrollSpeed:14,
    onStart:evt=>{evt.item.dataset.dragFrom=evt.from.dataset.date||'';navigator.vibrate?.(20)},
    onEnd:async evt=>{if(busy)return;const item=evt.item,id=item.dataset.meal,from=item.dataset.dragFrom||evt.from.dataset.date,target=evt.to.dataset.date;delete item.dataset.dragFrom;if(!id||!target||from===target){prepareMeals();return}busy=true;const msg=document.getElementById('message');if(msg)msg.innerHTML='<div class="status">Moving dinner and its linked lunch…</div>';try{await persistMove(id,target);location.reload()}catch(err){if(msg)msg.innerHTML=`<div class="status">Could not move: ${err.message}</div>`;setTimeout(()=>location.reload(),900)}finally{busy=false}}
  });sortables.set(day,sortable);
}
function init(){prepareMeals();document.querySelectorAll('.day[data-date]').forEach(initDay)}
const style=document.createElement('style');style.textContent='.day-drag-handle,.day-pair-handle{display:none!important}.drag-ghost{opacity:.35!important}.drag-source{opacity:.55!important}.drag-grip{border:1px solid rgba(31,75,63,.14);background:rgba(31,75,63,.05)}';document.head.appendChild(style);
const observer=new MutationObserver(()=>queueMicrotask(init));
function start(){const week=document.getElementById('week');if(!week)return;observer.observe(week,{childList:true,subtree:true});init()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
