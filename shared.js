export const APP_VERSION='20261010-integrated12';
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function localDate(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
export function addDays(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function fmt(date,options={weekday:'short',day:'numeric',month:'short'}){return new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{timeZone:'Europe/London',...options})}
export function dates(start,end){const out=[];for(let d=start;d<=end;d=addDays(d,1))out.push(d);return out}
export const money=v=>v==null?'Not recorded':new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(Number(v));
export const SECTIONS=['Fruit & veg','Meat & fish','Dairy & chilled','Bakery & grains','Cupboard & cooking','Breakfast','Snacks','Drinks','Baby','Toiletries','Household & cleaning','Other food','Other'];
export function check(result){if(result.error)throw result.error;return result.data}
export function allocation(meal,all){const p=meal.portions||{};if(meal.meal_mode==='planned_leftover'){const source=all.find(x=>x.id===meal.source_meal_id);return `${p.adultPortions||2} adult lunches${source?' · prepared with '+fmt(source.scheduled_date)+' dinner':''}`}
 const lunch=all.find(x=>x.lunch_package_dinner_id===meal.id&&x.meal_mode==='planned_leftover');const adults=Number(p.adultPortions||0)-(lunch?Number(lunch.portions?.adultPortions||2):0);return [adults>0?`${adults} adult ${meal.slot} portions`:'',p.toddlerPortions?`${p.toddlerPortions} child portion${p.toddlerPortions>1?'s':''}`:'',lunch?`Reserve ${lunch.portions?.adultPortions||2} adult lunches for ${fmt(lunch.scheduled_date)}`:''].filter(Boolean).join(' · ')||'Use the planned recipe quantities'}
export function ruleMatches(meal,prefs){const hay=(meal.title+' '+(meal.recipe_ingredients||[]).join(' ')).toLowerCase();return prefs.filter(p=>p.preference_type==='avoid'&&hay.includes(p.subject.toLowerCase().trim()))}
export function estimate(items){const relevant=items.filter(x=>!x.have_at_home),priced=relevant.filter(x=>x.estimated_cost!=null);return {total:priced.reduce((s,x)=>s+Number(x.estimated_cost),0),priced:priced.length,count:relevant.length,complete:relevant.length>0&&priced.length===relevant.length}}
export function scaledLabel(label,factor){if(factor===1)return label;return label.replace(/\b(\d+(?:\.\d+)?)(?=\s*(?:kg|g|ml|litres?|tsp|tbsp|cloves?|dry|from stock|$))/g,n=>String(Math.round(Number(n)*factor*100)/100))}
export class Latest{value=0;next(){return ++this.value}is(n){return n===this.value}}

export function scheduleNote(note,meal,all){const lunch=meal.slot==='lunch'?meal:all.find(x=>x.lunch_package_dinner_id===meal.id);const day=lunch?fmt(lunch.scheduled_date,{weekday:'long',day:'numeric',month:'short'}):'the planned lunch day';return String(note||'').replace(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/g,day)}
