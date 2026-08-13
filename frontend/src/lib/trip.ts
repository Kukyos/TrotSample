// Derived values only. docs/SCHEMA.md lists trip status, destination count,
// budget totals, category breakdown, and average daily cost as calculated data,
// never stored columns. These move to SQL views when the services layer lands.

import { cityById } from '../fixtures/catalog'
import {
  itemsForTrip,
  stopsForTrip,
  type ItemKind,
  type Trip,
} from '../fixtures/trips'

export type TripPhase = 'ongoing' | 'upcoming' | 'completed'

const KIND_ORDER: ItemKind[] = ['transport', 'stay', 'activity', 'meal', 'other']

export const KIND_LABELS: Record<ItemKind, string> = {
  transport: 'Transport',
  stay: 'Stays',
  activity: 'Activities',
  meal: 'Food',
  other: 'Other',
}

function atMidnight(value: string) {
  const date = new Date(`${value}T00:00:00`)
  date.setHours(0, 0, 0, 0)
  return date
}

/** Ongoing, upcoming, and completed are derived from dates, never stored. */
export function tripPhase(trip: Trip, today = new Date()): TripPhase {
  const now = atMidnight(today.toISOString().slice(0, 10))
  if (atMidnight(trip.end_date) < now) return 'completed'
  if (atMidnight(trip.start_date) > now) return 'upcoming'
  return 'ongoing'
}

export function tripNights(trip: Trip) {
  const ms = atMidnight(trip.end_date).getTime() - atMidnight(trip.start_date).getTime()
  return Math.max(1, Math.round(ms / 86_400_000))
}

export function tripCityNames(tripId: string) {
  return stopsForTrip(tripId).map((stop) => cityById.get(stop.city_id)?.name ?? 'Unknown')
}

export type BudgetSlice = {
  kind: ItemKind
  label: string
  amount: number
  share: number
}

export type TripBudget = {
  spent: number
  budget: number | null
  remaining: number | null
  share: number | null
  overBudget: boolean
  perDay: number
  slices: BudgetSlice[]
  currency: string
}

export function tripBudget(trip: Trip): TripBudget {
  const items = itemsForTrip(trip.id)
  const totals = new Map<ItemKind, number>()
  for (const item of items) {
    totals.set(item.kind, (totals.get(item.kind) ?? 0) + item.estimated_cost)
  }

  const spent = [...totals.values()].reduce((sum, value) => sum + value, 0)
  const slices = KIND_ORDER.filter((kind) => (totals.get(kind) ?? 0) > 0)
    .map((kind) => ({
      kind,
      label: KIND_LABELS[kind],
      amount: totals.get(kind) ?? 0,
      // ponytail: guard the empty-trip case; spent of 0 would make every share NaN
      share: spent > 0 ? (totals.get(kind) ?? 0) / spent : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const budget = trip.budget_amount
  return {
    spent,
    budget,
    remaining: budget === null ? null : budget - spent,
    share: budget ? spent / budget : null,
    overBudget: budget !== null && spent > budget,
    perDay: Math.round(spent / tripNights(trip)),
    slices,
    currency: trip.currency_code,
  }
}

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateRange(start: string, end: string) {
  const from = atMidnight(start)
  const to = atMidnight(end)
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
  const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit' })
  const dayMonth = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' })
  const full = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return sameMonth ? `${day.format(from)}–${full.format(to)}` : `${dayMonth.format(from)} – ${full.format(to)}`
}

export function formatDay(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}
