import type { City } from '../types/domain'
import { getSupabaseClient } from './supabase'

export async function searchCities(query: string, limit = 20) {
  const normalized = query.trim()
  if (normalized.length < 2) return []
  const { data, error } = await getSupabaseClient().rpc('search_city_catalog', {
    p_query: normalized,
    p_limit: limit,
  })
  if (error) throw error
  return (data ?? []) as City[]
}

export async function getPopularCities(limit = 6) {
  const { data, error } = await getSupabaseClient()
    .from('cities')
    .select('*')
    .order('population', { ascending: false, nullsFirst: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as City[]
}
