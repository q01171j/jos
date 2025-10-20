type EnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY";

function requireEnvVar(name: EnvKey): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }
  return value;
}

const SUPABASE_URL = requireEnvVar("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = requireEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = requireEnvVar("NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY");

export { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY };
