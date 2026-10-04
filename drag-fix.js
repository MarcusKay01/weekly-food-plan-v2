import Sortable from 'https://esm.sh/sortablejs@1.15.6';

const PROJECT_REF='tskihefmcsqcdvjvzdwm';
const AUTH_KEY=`sb-${PROJECT_REF}-auth-token`;
let busy=false;

function sessionToken(){
  try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')?.access_token||null}catch{return null}
}

function ensureGrip(meal){
  meal.onpointerdown=null;
  meal.onpointermove=null;
  meal.onpointerup=null;
  meal.onpointercancel=null;
  let grip=meal.querySelector('.drag-grip');
  if(!grip){
    grip=document.createElement('span');
    grip.className='drag-grip';
    grip.textContent='⠿';
    meal.querySelector('.row')?.appendChild(grip);
  }
  grip.setAttribute('role','button');
  grip.setAttribute('aria-label','Drag meal to another day');
  grip.title='Drag meal';
  Object.assign(grip.style,{display:'grid',placeItems:'center',width:'38px',height:'44px',minWidth:'38px',marginLeft:'2px',borderRadius:'10px',color:'#6a736e',fontSize:'23px',lineHeight:'1',cursor:'grab',touchAction:'none',userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none'});
  const hint=meal.querySelector('.drag-hint');
  if(hint)hint.textContent='Drag using grip';
}

async function persistMove(id,targetDate){
  const token=sessionToken();
  if(!token)throw new Error('Your session expired. Please sign in again.');
  const r=await fetch('https://tskihefmcsqcdvjvzdwm.supabase.co/rest/v1/rpc/move_meal',{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':'sb_publishable_AL_R6WjOMKyeWltHOth9yg_pGLg3rWD','Authorization':`Bearer ${token}`},
    body:JSON.stringify({target_meal_id:id,target_date:targetDate})
  });
  if(!r.ok){let msg='Meal could not be moved.';try{const j=await r.json();msg=j.message||msg}catch{}throw new Error(msg)}
}

function init(){
  document.querySelectorAll('.meal[data-draggable="true"]').forEach(ensureGrip);
  document.querySelectorAll('.day').forEach(day=>{
    if(day.dataset.sortableReady==='1')return;
    day.dataset.sortableReady='1';
    Sortable.create(day,{
      group:'meal-days',
      draggable:'.meal[data-draggable="true"]',
      handle:'.drag-grip',
      animation:150,
      forceFallback:true,
      fallbackOnBody:true,
      fallbackTolerance:3,
      touchStartThreshold:4,
      chosenClass:'dragging',
      ghostClass:'dragging',
      scroll:true,
      scrollSensitivity:70,
      scrollSpeed:12,
      onStart:evt=>{evt.item.dataset.dragFrom=evt.from.dataset.date||'';navigator.vibrate?.(20)},
      onEnd:async evt=>{
        if(busy)return;
        const id=evt.item.dataset.meal;
        const from=evt.item.dataset.dragFrom||evt.from.dataset.date;
        const target=evt.to.dataset.date;
        delete evt.item.dataset.dragFrom;
        if(!id||!target||from===target){init();return}
        busy=true;
        try{await persistMove(id,target);location.reload()}catch(err){alert(err.message);location.reload()}finally{busy=false}
      }
    });
  });
}

const observer=new MutationObserver(()=>queueMicrotask(init));
function start(){
  const week=document.getElementById('week');
  if(!week)return;
  observer.observe(week,{childList:true,subtree:true});
  init();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
