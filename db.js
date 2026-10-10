import{createClient}from'https://esm.sh/@supabase/supabase-js@2.117.3';
import{SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY}from'./config.js?v=release-44900f4bb3';
export const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
