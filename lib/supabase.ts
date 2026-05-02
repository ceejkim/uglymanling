const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required Supabase env: ${name}`);
  }

  return value;
}

function getHeaders(useServiceRole = false) {
  const apiKey = useServiceRole
    ? requireEnv(supabaseServiceRoleKey, "SUPABASE_SERVICE_ROLE_KEY")
    : requireEnv(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
}

export function getSupabaseUrl() {
  return requireEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL");
}

export async function upsertSupabaseRow<T extends Record<string, unknown>>({
  table,
  values,
  onConflict
}: {
  table: string;
  values: T | T[];
  onConflict?: string;
}) {
  const conflictQuery = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : "";
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${table}${conflictQuery}`, {
    method: "POST",
    headers: {
      ...getHeaders(true),
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(values)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as T[];
}

export async function deleteSupabaseRows({
  table,
  filters = []
}: {
  table: string;
  filters?: string[];
}) {
  const params = new URLSearchParams();

  for (const filter of filters) {
    const [key, value] = filter.split("=", 2);
    params.append(key, value);
  }

  const query = params.toString();
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${table}${query ? `?${query}` : ""}`, {
    method: "DELETE",
    headers: {
      ...getHeaders(true),
      Prefer: "return=minimal"
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function selectSupabaseRows<T>({
  table,
  select = "*",
  filters = [],
  orderBy,
  ascending = false,
  limit
}: {
  table: string;
  select?: string;
  filters?: string[];
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
}) {
  const params = new URLSearchParams({ select });

  for (const filter of filters) {
    const [key, value] = filter.split("=", 2);
    params.append(key, value);
  }

  if (orderBy) {
    params.set("order", `${orderBy}.${ascending ? "asc" : "desc"}`);
  }

  if (limit) {
    params.set("limit", String(limit));
  }

  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${table}?${params.toString()}`, {
    headers: getHeaders(true),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as T[];
}
