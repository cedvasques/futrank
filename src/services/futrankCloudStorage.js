import { isSupabaseConfigured, supabase } from '../lib/supabase'

const TABLE_NAME = 'futrank_state'
const SCHEMA_VERSION = 1

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase nao esta configurado.')
  }
}

function normalizeStateId(stateId) {
  return String(stateId || '').trim()
}

export async function loadFutRankState(stateId) {
  assertSupabaseConfigured()
  const id = normalizeStateId(stateId)

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('state, updated_at')
    .eq('id', id)
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

export async function saveFutRankState(stateId, state) {
  assertSupabaseConfigured()
  const id = normalizeStateId(stateId)

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(
      {
        id,
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

export function subscribeFutRankState(stateId, onChange) {
  if (!isSupabaseConfigured || !supabase) {
    return () => {}
  }

  const id = normalizeStateId(stateId)
  const channel = supabase
    .channel(`futrank-state:${id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
        filter: `id=eq.${id}`,
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
