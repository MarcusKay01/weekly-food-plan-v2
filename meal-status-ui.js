import{createClient}from'https://esm.sh/@supabase/supabase-js@2';
import{SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY}from'./config.js';
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
const STYLE_ID='mealStatusUiStyle';
function addStyle(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
.meal.skipped{opacity:.48!important;position:relative!important}
.meal.skipped .title{text-decoration:line-through!important;text-decoration-thickness:2px!important}
.meal-status-badge{display:inline-flex!important;align-items:center;margin-top:7px;padding:4px 9px;border-radius:999px;font:800 .61rem/1.2 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.meal-status-badge.skipped{background:#ead2ca!important;color:#7b3025!important;border:1px solid #d9aa9d!important}
.meal.skipped .complete{opacity:.28!important}
`;document.head.appendChild(s)}
let running=false,again=false;
async function apply(){if(running){again=true;return}running=true;try{addStyle();const cards=[...document.querySelectorAll('.meal[data-meal]')];if(!cards.length)return;const ids=cards.map(x=>x.dataset.meal).filter(Boolean);const{data,error}=await db.from('meals').select('id,execution_status').in('id',ids);if(error){console.error('Meal status UI:',error);return}const statuses=new Map((data||[]).map(x=>[x.id,x.execution_status]));cards.forEach(meal=>{const status=statuses.get(meal.dataset.meal);meal.dataset.executionStatus=status||'';meal.classList.toggle('skipped',status==='skipped');meal.querySelectorAll('.meal-status-badge').forEach(x=>x.remove());if(status==='skipped'){const copy=meal.querySelector('.meal-copy');if(copy){const badge=document.createElement('span');badge.className='meal-status-badge skipped';badge.textContent='Skipped';copy.appendChild(badge)}meal.querySelector('.drag-grip')?.remove();delete meal.dataset.draggable}})}finally{running=false;if(again){again=false;setTimeout(apply,0)}}}
function start(){apply();const week=document.getElementById('week');if(week)new MutationObserver(()=>setTimeout(apply,0)).observe(week,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
