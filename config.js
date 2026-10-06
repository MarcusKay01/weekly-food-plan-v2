export const SUPABASE_URL = 'https://tskihefmcsqcdvjvzdwm.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_AL_R6WjOMKyeWltHOth9yg_pGLg3rWD';

function loadInteractionEnhancements(){setTimeout(()=>import('./drag-fix.js?v=pair8').catch(err=>console.error('Optional interaction enhancement failed:',err)),500)}
if(document.readyState==='complete')loadInteractionEnhancements();else window.addEventListener('load',loadInteractionEnhancements,{once:true});
