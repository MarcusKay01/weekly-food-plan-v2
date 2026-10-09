import{SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY}from'./config.js';
import Sortable from 'https://esm.sh/sortablejs@1.15.6';

const PROJECT_REF='tskihefmcsqcdvjvzdwm';
const AUTH_KEY=`sb-${PROJECT_REF}-auth-token`;
let busy=false;
let currentDays=[];

function sessionToken(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')?.access_token||null}catch{return null}}
function mealType(meal){return (meal?.dataset.slot||'').trim().toLowerCase()}
function inferStatus(meal){return meal.dataset.status|| (meal.classList.contains('done')?'done':'upcoming')}
function isDinner(meal){return mealType(meal).startsWith('dinner')&&inferStatus(meal)==='upcoming'}
function showMoveError(message){const box=document.getElementById('message');if(box)box.innerHTML='';window.alert('Meal could not be moved: '+message)}
function ensureGrip(meal){meal.dataset.draggable='true';let grip=meal.querySelector('.drag-grip');if(!grip){grip=document.createElement('span');grip.className='drag-grip';grip.textContent='⠿';meal.querySelector('.row')?.appendChild(grip)}grip.setAttribute('role','button');grip.setAttribute('aria-label','Move dinner to another day');grip.title='Move dinner';Object.assign(grip.style,{display:'grid',placeItems:'center',width:'40px',height:'44px',minWidth:'40px',marginLeft:'2px',borderRadius:'12px',color:'#1F4B3F',fontSize:'23px',lineHeight:'1',cursor:'grab',touchAction:'none',userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none'})}
async function apiFetch(path,options={}){const token=sessionToken();if(!token)throw new Error('Your session expired. Please sign in again.');const r=await fetch(SUPABASE_URL+path,{...options,headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`,...(options.headers||{})}});if(!r.ok){let msg='Request failed.';try{const j=await r.json();msg=j.message||j.details||msg}catch{}throw new Error(msg)}return r}
async function persistMove(id,targetDate,targetMealId){const rpc=targetMealId?'swap_meals':'move_meal';const body=targetMealId?{first_meal_id:id,second_meal_id:targetMealId}:{target_meal_id:id,target_date:targetDate};await apiFetch('/rest/v1/rpc/'+rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
function prepareMeals(){document.querySelectorAll('.meal[data-meal]').forEach(meal=>{if(isDinner(meal)&&!!meal.querySelector('.complete'))ensureGrip(meal);else{delete meal.dataset.draggable;meal.querySelector('.drag-grip')?.remove()}})}
function resetSortables(){currentDays.forEach(day=>{try{Sortable.get(day)?.destroy()}catch{}});currentDays=[]}
function initDay(day){const sortable=Sortable.create(day,{group:'dinner-days',draggable:'.meal[data-draggable="true"]',handle:'.drag-grip',animation:170,forceFallback:true,fallbackOnBody:true,fallbackTolerance:4,touchStartThreshold:4,chosenClass:'drag-source',ghostClass:'drag-ghost',dragClass:'dragging',scroll:true,scrollSensitivity:80,scrollSpeed:14,onStart:evt=>{evt.item.dataset.dragFrom=evt.from.dataset.date||'';navigator.vibrate?.(20)},onEnd:async evt=>{if(busy)return;const item=evt.item,id=item.dataset.meal,from=item.dataset.dragFrom||evt.from.dataset.date,target=evt.to.dataset.date,targetMeal=[...evt.to.querySelectorAll('.meal[data-slot="dinner"][data-draggable="true"]')].find(x=>x!==item);delete item.dataset.dragFrom;if(!id||!target||from===target){document.dispatchEvent(new CustomEvent('meal-move-failed'));return}busy=true;const msg=document.getElementById('message');if(msg)msg.innerHTML='<div class="status">Updating the week…</div>';try{await persistMove(id,target,targetMeal?.dataset.meal||null);if(msg)msg.innerHTML='';document.dispatchEvent(new CustomEvent('meal-moved'))}catch(err){showMoveError(err.message);document.dispatchEvent(new CustomEvent('meal-move-failed'))}finally{busy=false}}});currentDays.push(day)}
function init(){resetSortables();prepareMeals();document.querySelectorAll('.day[data-date]').forEach(initDay)}
const style=document.createElement('style');style.textContent='.day-drag-handle,.day-pair-handle{display:none!important}.drag-grip{display:grid!important;border:1px solid rgba(31,75,63,.14)!important;background:rgba(31,75,63,.05)!important}.drag-ghost{opacity:.35!important}.drag-source{opacity:.55!important}';document.head.appendChild(style);
document.addEventListener('week-rendered',()=>setTimeout(init,0));init();
