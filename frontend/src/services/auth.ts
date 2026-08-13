import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

export type AuthViewer = {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
}

export type SignUpInput = {
  displayName: string
  email: string
  password: string
}

function viewerFromUser(user: User): AuthViewer {
  const displayName = user.user_metadata.display_name
  const avatarUrl = user.user_metadata.avatar_url

  return {
    id: user.id,
    email: user.email ?? '',
    displayName: typeof displayName === 'string' ? displayName : null,
    avatarUrl: typeof avatarUrl === 'string' ? avatarUrl : null,
  }
}

export async function getCurrentViewer() {
  if (!isSupabaseConfigured) return null

  const { data, error } = await getSupabaseClient().auth.getSession()
  if (error) throw error
  return data.session ? viewerFromUser(data.session.user) : null
}

export function subscribeToAuthChanges(
  onChange: (viewer: AuthViewer | null) => void,
) {
  if (!isSupabaseConfigured) return () => undefined

  const { data } = getSupabaseClient().auth.onAuthStateChange(
    (_event, session: Session | null) => {
      onChange(session ? viewerFromUser(session.user) : null)
    },
  )

  return () => data.subscription.unsubscribe()
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return viewerFromUser(data.user)
}

export async function signUpWithPassword({
  displayName,
  email,
  password,
}: SignUpInput) {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName.trim() },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })
  if (error) throw error

  return {
    viewer: data.session ? viewerFromUser(data.user!) : null,
    requiresEmailConfirmation: data.session === null,
  }
}

export async function signOutCurrentUser() {
  const { error } = await getSupabaseClient().auth.signOut()
  if (error) throw error
}
