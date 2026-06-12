import { createClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://mclkvuunzahktgtyccpk.supabase.co';
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbGt2dXVuemFoa3RndHljY3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjgyOTYsImV4cCI6MjA5NTkwNDI5Nn0.Q1cJYjy_hgwlTTdesbvhmvj6HHrPHpC5f1ySd9ymkc8';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const useFallback = !envUrl.startsWith('http');

// Audit Environment Variables on Client/Server Initialization
if (typeof window === "undefined" || process.env.NODE_ENV === "development") {
  const missingVars: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missingVars.length > 0) {
    console.error(
      `[Supabase Connection Audit] ERROR: Missing environment variables: ${missingVars.join(", ")}`
    );
  } else {
    console.log("[Supabase Connection Audit] All environment variables verified.");
  }
}

export const isDemoMode = false;
const supabaseUrl = useFallback ? fallbackUrl : envUrl;
const supabaseAnonKey = (useFallback || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) 
  ? fallbackAnonKey 
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
