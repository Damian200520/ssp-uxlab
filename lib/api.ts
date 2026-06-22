import { getSupabaseClient } from "./supabase";

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const headers = new Headers(init.headers);

  try {
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
  } catch {
    // Las rutas públicas del backend pueden funcionar sin sesión.
  }

  return globalThis.fetch(input, {
    ...init,
    headers,
  });
}
