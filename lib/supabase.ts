import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SupabaseRow = Record<string, unknown>;
type SupportedFilterOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in" | "is";

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required Supabase env: ${name}`);
  }

  return value;
}

function createSupabaseServerClient(apiKey: string) {
  return createClient(requireEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"), apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function getSupabaseClient(useServiceRole = false): SupabaseClient {
  const apiKey = useServiceRole
    ? requireEnv(supabaseServiceRoleKey, "SUPABASE_SERVICE_ROLE_KEY")
    : requireEnv(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createSupabaseServerClient(apiKey);
}

export function getSupabaseAdminClient() {
  return getSupabaseClient(true);
}

function parseFilter(filter: string) {
  const [column, expression] = filter.split("=", 2);

  if (!column || !expression) {
    throw new Error(`Invalid Supabase filter: ${filter}`);
  }

  const firstDot = expression.indexOf(".");

  if (firstDot === -1) {
    throw new Error(`Unsupported Supabase filter expression: ${filter}`);
  }

  const operator = expression.slice(0, firstDot) as SupportedFilterOperator;
  const rawValue = expression.slice(firstDot + 1);

  return {
    column,
    operator,
    rawValue
  };
}

function normalizeIsValue(value: string) {
  if (value === "null") {
    return null;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}

function normalizeInValue(value: string) {
  const trimmed = value.replace(/^\(|\)$/g, "");
  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function applyFilter(query: any, filter: string) {
  const { column, operator, rawValue } = parseFilter(filter);

  switch (operator) {
    case "eq":
      return query.eq(column, rawValue);
    case "neq":
      return query.neq(column, rawValue);
    case "gt":
      return query.gt(column, rawValue);
    case "gte":
      return query.gte(column, rawValue);
    case "lt":
      return query.lt(column, rawValue);
    case "lte":
      return query.lte(column, rawValue);
    case "like":
      return query.like(column, rawValue);
    case "ilike":
      return query.ilike(column, rawValue);
    case "in":
      return query.in(column, normalizeInValue(rawValue));
    case "is":
      return query.is(column, normalizeIsValue(rawValue));
    default:
      throw new Error(`Unsupported Supabase filter operator: ${operator}`);
  }
}

export function getSupabaseUrl() {
  return requireEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL");
}

export async function upsertSupabaseRow<T extends SupabaseRow>({
  table,
  values,
  onConflict
}: {
  table: string;
  values: T | T[];
  onConflict?: string;
}) {
  const client = getSupabaseClient(true);
  const { data, error } = await client
    .from(table)
    .upsert(values as any, {
      onConflict,
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown) as T[];
}

export async function deleteSupabaseRows({
  table,
  filters = []
}: {
  table: string;
  filters?: string[];
}) {
  let query = getSupabaseClient(true).from(table).delete();

  for (const filter of filters) {
    query = applyFilter(query, filter);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }
}

export async function selectSupabaseRows<T extends SupabaseRow>({
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
  let query = getSupabaseClient(true).from(table).select(select);

  for (const filter of filters) {
    query = applyFilter(query, filter);
  }

  if (orderBy) {
    query = query.order(orderBy, { ascending });
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown) as T[];
}
