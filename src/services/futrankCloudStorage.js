import { futRankStateId, isSupabaseConfigured, supabase } from '../lib/supabase'

const TABLE_NAME = 'futrank_state'
const SCHEMA_VERSION = 1

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase nao esta configurado.')
  }
}

export async function loadFutRankState() {
  assertSupabaseConfigured()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('state, updated_at')
    .eq('id', futRankStateId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return {
    state: data.state,
    updatedAt: data.updated_at,
  }
}

export async function saveFutRankState(state) {
  assertSupabaseConfigured()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(
      {
        id: futRankStateId,
        schema_version: SCHEMA_VERSION,
        state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('updated_at')
    .single()

  if (error) {
    throw error
  }

  return data.updated_at
}

export function subscribeFutRankState(onChange) {
  if (!isSupabaseConfigured || !supabase) {
    return () => {}
  }

  const channel = supabase
    .channel(`futrank-state:${futRankStateId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
        filter: `id=eq.${futRankStateId}`,
      },
      (payload) => {
        if (payload.new?.state) {
          onChange(payload.new.state, payload.new.updated_at)
        }
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
