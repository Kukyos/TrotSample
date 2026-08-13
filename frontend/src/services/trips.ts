import type { ItemKind, Trip } from '../types/domain'
import { getSupabaseClient } from './supabase'

const TRIP_SELECT = `
  *,
  trip_stops (
    *,
    city:cities (*),
    itinerary_items (*)
  )
`

export type CreateTripInput = {
  title: string
  description: string
  startDate: string
  endDate: string
  budgetAmount: string
  currencyCode: string
  stops: Array<{
    cityId: number
    startDate: string
    endDate: string
    activityIds: number[]
  }>
}

function normalizeTrip(trip: Trip): Trip {
  return {
    ...trip,
    budget_amount: trip.budget_amount === null ? null : Number(trip.budget_amount),
    trip_stops: [...(trip.trip_stops ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((stop) => ({
        ...stop,
        itinerary_items: [...(stop.itinerary_items ?? [])]
          .sort((a, b) => a.position - b.position)
          .map((item) => ({
            ...item,
            estimated_cost: item.estimated_cost === null ? null : Number(item.estimated_cost),
          })),
      })),
  }
}

export async function listTrips() {
  const client = getSupabaseClient()
  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError) throw userError
  if (!userData.user) return []
  const { data, error } = await client
    .from('trips')
    .select(TRIP_SELECT)
    .eq('owner_id', userData.user.id)
    .order('start_date')
  if (error) throw error
  return ((data ?? []) as unknown as Trip[]).map(normalizeTrip)
}

export async function getTrip(tripId: string) {
  const { data, error } = await getSupabaseClient()
    .from('trips')
    .select(TRIP_SELECT)
    .eq('id', tripId)
    .maybeSingle()
  if (error) throw error
  return data ? normalizeTrip(data as unknown as Trip) : null
}

export async function createTrip(input: CreateTripInput) {
  const { data, error } = await getSupabaseClient().rpc('create_trip', { input })
  if (error) throw error
  return data as string
}

export async function addActivityToStop(stopId: string, activityId: number) {
  const { data, error } = await getSupabaseClient().rpc('add_activity_to_stop', {
    p_stop_id: stopId,
    p_activity_id: activityId,
  })
  if (error) throw error
  return data as string
}

export async function scheduleItem(input: {
  itemId: string
  date: string
  time: string
  estimatedCost: number | null
}) {
  const { error } = await getSupabaseClient().rpc('schedule_itinerary_item', {
    p_item_id: input.itemId,
    p_local_date: input.date,
    p_local_time: input.time,
    ...(input.estimatedCost === null ? {} : { p_estimated_cost: input.estimatedCost }),
  })
  if (error) throw error
}

export async function addCustomItem(input: {
  stopId: string
  kind: ItemKind
  title: string
  date: string
  time: string
  estimatedCost: number | null
}) {
  const { data, error } = await getSupabaseClient().rpc('add_custom_itinerary_item', {
    p_stop_id: input.stopId,
    p_kind: input.kind,
    p_title: input.title,
    p_local_date: input.date,
    p_local_time: input.time,
    ...(input.estimatedCost === null ? {} : { p_estimated_cost: input.estimatedCost }),
  })
  if (error) throw error
  return data as string
}

export async function removeItem(itemId: string) {
  const { error } = await getSupabaseClient().rpc('remove_itinerary_item', { p_item_id: itemId })
  if (error) throw error
}

export async function reorderStops(tripId: string, orderedStopIds: string[]) {
  const { error } = await getSupabaseClient().rpc('reorder_trip_stops', {
    p_trip_id: tripId,
    p_ordered_stop_ids: orderedStopIds,
  })
  if (error) throw error
}

export async function reorderItems(stopId: string, orderedItemIds: string[]) {
  const { error } = await getSupabaseClient().rpc('reorder_itinerary_items', {
    p_stop_id: stopId,
    p_ordered_item_ids: orderedItemIds,
  })
  if (error) throw error
}

export async function finishTrip(tripId: string) {
  const { error } = await getSupabaseClient().rpc('finish_trip', { p_trip_id: tripId })
  if (error) throw error
}
