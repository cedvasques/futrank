import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { defaultFutRankStateId, isSupabaseConfigured } from '../lib/supabase'
import { loadFutRankState, saveFutRankState, subscribeFutRankState } from '../services/futrankCloudStorage'
import { applyEvaluationToPlayer, buildPlayer, canConfirmPresence } from '../utils/player'
import { balanceTeams } from '../utils/balanceTeams'

const STORAGE_KEY = 'futrank-storage-v1'
const AUTH_STORAGE_KEY = 'futrank-auth-v1'
const CLOUD_SAVE_DELAY_MS = 800

const LOCAL_GROUP = {
  id: 'local',
  stateId: defaultFutRankStateId,
  name: 'FutRank local',
  playerCode: null,
  adminCode: null,
  createdAt: null,
}

let cloudSyncStarted = false
let activeCloudStateId = null
let cloudSaveTimer = null
let localStoreUnsubscribe = null
let remoteStoreUnsubscribe = null
let isApplyingCloudState = false
let isCloudSaveInFlight = false
let shouldRunAnotherCloudSave = false

function normalizeGroup(group) {
  if (!group || typeof group !== 'object') {
    return null
  }

  return {
    id: group.id ?? null,
    stateId: group.stateId ?? null,
    name: group.name ?? 'Pelada',
    leaderName: group.leaderName ?? null,
    playerCode: group.playerCode ?? null,
    adminCode: group.adminCode ?? null,
    createdAt: group.createdAt ?? null,
  }
}

function normalizePersistedState(state) {
  return {
    group: normalizeGroup(state?.group),
    players: Array.isArray(state?.players) ? state.players.map(buildPlayer) : [],
    evaluations: Array.isArray(state?.evaluations) ? state.evaluations : [],
    session: {
      evaluationsOpen: Boolean(state?.session?.evaluationsOpen),
      updatedAt: state?.session?.updatedAt ?? null,
    },
    teams: state?.teams ?? null,
  }
}

function emptyPersistedState(group = null) {
  return normalizePersistedState({
    group,
    players: [],
    evaluations: [],
    session: {
      evaluationsOpen: false,
      updatedAt: null,
    },
    teams: null,
  })
}

function buildPersistedState(state) {
  return normalizePersistedState(state)
}

function serializePersistedState(state) {
  return JSON.stringify(buildPersistedState(state))
}

function getCloudErrorMessage(error) {
  return error?.message ?? 'Erro inesperado ao sincronizar com o Supabase.'
}

function normalizeAccessCode(accessCode) {
  return String(accessCode || '').replace(/\s+/g, '').toUpperCase()
}

function buildGroupStateId(groupId) {
  return `group-${String(groupId).toLowerCase()}`
}

function randomCode(size) {
  return crypto.randomUUID().replace(/-/g, '').slice(0, size).toUpperCase()
}

function buildGroupCodes(groupId) {
  const pin = randomCode(4)

  return {
    playerCode: `FR-${groupId}`,
    adminCode: `FR-${groupId}-ADM-${pin}`,
  }
}

function parseAccessCode(accessCode) {
  const normalizedCode = normalizeAccessCode(accessCode)
  const adminMatch = normalizedCode.match(/^FR-([A-Z0-9]{6})-ADM-[A-Z0-9]{4}$/)

  if (adminMatch) {
    return {
      groupId: adminMatch[1],
      role: 'admin',
      normalizedCode,
      stateId: buildGroupStateId(adminMatch[1]),
    }
  }

  const playerMatch = normalizedCode.match(/^FR-([A-Z0-9]{6})$/)

  if (playerMatch) {
    return {
      groupId: playerMatch[1],
      role: 'player',
      normalizedCode,
      stateId: buildGroupStateId(playerMatch[1]),
    }
  }

  return null
}

function readAuthSession() {
  try {
    const savedSession = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return savedSession ? JSON.parse(savedSession) : null
  } catch {
    return null
  }
}

function saveAuthSession(session) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

function setSyncState(payload) {
  useFutRankStore.setState((state) => ({
    sync: {
      ...state.sync,
      ...payload,
    },
  }))
}

function stopRemoteCloudSubscription() {
  if (remoteStoreUnsubscribe) {
    remoteStoreUnsubscribe()
    remoteStoreUnsubscribe = null
  }
}

function applyCloudState(cloudState, updatedAt) {
  const normalizedState = normalizePersistedState(cloudState)
  const remoteJson = JSON.stringify(normalizedState)
  const localJson = serializePersistedState(useFutRankStore.getState())

  if (remoteJson === localJson) {
    setSyncState({
      status: 'synced',
      message: 'Sincronizado com Supabase',
      lastSyncedAt: updatedAt ?? new Date().toISOString(),
      error: null,
    })
    return
  }

  isApplyingCloudState = true

  try {
    useFutRankStore.setState((state) => ({
      ...state,
      ...normalizedState,
      sync: {
        ...state.sync,
        status: 'synced',
        message: 'Sincronizado com Supabase',
        lastSyncedAt: updatedAt ?? new Date().toISOString(),
        error: null,
      },
    }))
  } finally {
    isApplyingCloudState = false
  }
}

async function saveCloudSnapshot() {
  if (!isSupabaseConfigured || !activeCloudStateId) {
    return
  }

  if (isCloudSaveInFlight) {
    shouldRunAnotherCloudSave = true
    return
  }

  isCloudSaveInFlight = true
  setSyncState({
    status: 'saving',
    message: 'Salvando no Supabase',
    error: null,
  })

  try {
    const updatedAt = await saveFutRankState(activeCloudStateId, buildPersistedState(useFutRankStore.getState()))

    setSyncState({
      status: 'synced',
      message: 'Sincronizado com Supabase',
      lastSyncedAt: updatedAt,
      error: null,
    })
  } catch (error) {
    setSyncState({
      status: 'error',
      message: 'Falha ao salvar no Supabase; cache local mantido.',
      error: getCloudErrorMessage(error),
    })
  } finally {
    isCloudSaveInFlight = false

    if (shouldRunAnotherCloudSave) {
      shouldRunAnotherCloudSave = false
      scheduleCloudSave()
    }
  }
}

function scheduleCloudSave() {
  if (!cloudSyncStarted || isApplyingCloudState) {
    return
  }

  window.clearTimeout(cloudSaveTimer)
  setSyncState({
    status: 'pending',
    message: 'Alteracoes aguardando envio',
    error: null,
  })

  cloudSaveTimer = window.setTimeout(saveCloudSnapshot, CLOUD_SAVE_DELAY_MS)
}

function startLocalCloudAutosave() {
  if (localStoreUnsubscribe) {
    return
  }

  localStoreUnsubscribe = useFutRankStore.subscribe((state, previousState) => {
    if (isApplyingCloudState) {
      return
    }

    if (serializePersistedState(state) !== serializePersistedState(previousState)) {
      scheduleCloudSave()
    }
  })
}

function startRemoteCloudSubscription(stateId) {
  stopRemoteCloudSubscription()

  remoteStoreUnsubscribe = subscribeFutRankState(stateId, (state, updatedAt) => {
    if (stateId === activeCloudStateId) {
      applyCloudState(state, updatedAt)
    }
  })
}

async function startCloudSession({ stateId, role, accessCode }) {
  activeCloudStateId = stateId
  cloudSyncStarted = true
  setSyncState({
    enabled: true,
    status: 'loading',
    message: 'Carregando grupo no Supabase',
    error: null,
  })

  const remoteState = await loadFutRankState(stateId)

  if (!remoteState?.state) {
    throw new Error('Grupo nao encontrado.')
  }

  const normalizedState = normalizePersistedState(remoteState.state)
  const group = normalizedState.group

  if (!group) {
    throw new Error('Grupo invalido.')
  }

  saveAuthSession({ stateId, role, accessCode })
  applyCloudState(normalizedState, remoteState.updatedAt)

  useFutRankStore.setState((state) => ({
    auth: {
      ...state.auth,
      status: 'authenticated',
      role,
      groupId: group.id,
      groupName: group.name,
      groupStateId: stateId,
      accessCode,
      error: null,
    },
  }))

  startLocalCloudAutosave()
  startRemoteCloudSubscription(stateId)
}

export const useFutRankStore = create(
  persist(
    (set, get) => ({
      ...emptyPersistedState(),
      auth: {
        status: isSupabaseConfigured ? 'checking' : 'authenticated',
        role: isSupabaseConfigured ? null : 'admin',
        groupId: isSupabaseConfigured ? null : LOCAL_GROUP.id,
        groupName: isSupabaseConfigured ? null : LOCAL_GROUP.name,
        groupStateId: isSupabaseConfigured ? null : LOCAL_GROUP.stateId,
        accessCode: null,
        error: null,
      },
      sync: {
        enabled: isSupabaseConfigured,
        status: isSupabaseConfigured ? 'idle' : 'local',
        message: isSupabaseConfigured ? 'Supabase pronto para conectar' : 'Usando armazenamento local',
        lastSyncedAt: null,
        error: null,
      },

      initializeCloudSync: async () => {
        if (!isSupabaseConfigured) {
          set((state) => ({
            group: LOCAL_GROUP,
            auth: {
              ...state.auth,
              status: 'authenticated',
              role: 'admin',
              groupId: LOCAL_GROUP.id,
              groupName: LOCAL_GROUP.name,
              groupStateId: LOCAL_GROUP.stateId,
              error: null,
            },
            sync: {
              ...state.sync,
              enabled: false,
              status: 'local',
              message: 'Usando armazenamento local',
              error: null,
            },
          }))
          return
        }

        const savedSession = readAuthSession()

        if (!savedSession?.stateId || !savedSession?.role || !savedSession?.accessCode) {
          set((state) => ({
            auth: {
              ...state.auth,
              status: 'guest',
              error: null,
            },
            sync: {
              ...state.sync,
              status: 'idle',
              message: 'Entre em um grupo para sincronizar',
              error: null,
            },
          }))
          return
        }

        if (cloudSyncStarted && activeCloudStateId === savedSession.stateId) {
          return
        }

        try {
          await startCloudSession(savedSession)
        } catch (error) {
          clearAuthSession()
          activeCloudStateId = null
          cloudSyncStarted = false
          stopRemoteCloudSubscription()

          set((state) => ({
            ...state,
            ...emptyPersistedState(),
            auth: {
              ...state.auth,
              status: 'guest',
              role: null,
              groupId: null,
              groupName: null,
              groupStateId: null,
              accessCode: null,
              error: getCloudErrorMessage(error),
            },
            sync: {
              ...state.sync,
              status: 'error',
              message: 'Nao foi possivel carregar o grupo.',
              error: getCloudErrorMessage(error),
            },
          }))
        }
      },

      createGroup: async ({ groupName, leaderName }) => {
        if (!isSupabaseConfigured) {
          return { ok: false, message: 'Supabase nao esta configurado para criar grupos.' }
        }

        const name = String(groupName || '').trim()

        if (!name) {
          return { ok: false, message: 'Informe o nome do grupo.' }
        }

        for (let attempt = 0; attempt < 5; attempt += 1) {
          const groupId = randomCode(6)
          const stateId = buildGroupStateId(groupId)
          const existingGroup = await loadFutRankState(stateId)

          if (existingGroup) {
            continue
          }

          const codes = buildGroupCodes(groupId)
          const group = {
            id: groupId,
            stateId,
            name,
            leaderName: String(leaderName || '').trim() || null,
            ...codes,
            createdAt: new Date().toISOString(),
          }
          const initialState = emptyPersistedState(group)

          await saveFutRankState(stateId, initialState)
          saveAuthSession({ stateId, role: 'admin', accessCode: group.adminCode })

          activeCloudStateId = stateId
          cloudSyncStarted = true
          isApplyingCloudState = true

          try {
            set((state) => ({
              ...state,
              ...initialState,
              auth: {
                ...state.auth,
                status: 'authenticated',
                role: 'admin',
                groupId: group.id,
                groupName: group.name,
                groupStateId: stateId,
                accessCode: group.adminCode,
                error: null,
              },
              sync: {
                ...state.sync,
                enabled: true,
                status: 'synced',
                message: 'Grupo criado no Supabase',
                lastSyncedAt: new Date().toISOString(),
                error: null,
              },
            }))
          } finally {
            isApplyingCloudState = false
          }

          startLocalCloudAutosave()
          startRemoteCloudSubscription(stateId)

          return { ok: true, group }
        }

        return { ok: false, message: 'Nao foi possivel gerar um codigo de grupo. Tente novamente.' }
      },

      joinGroup: async (accessCode) => {
        if (!isSupabaseConfigured) {
          return { ok: false, message: 'Supabase nao esta configurado para entrar em grupos.' }
        }

        const parsedCode = parseAccessCode(accessCode)

        if (!parsedCode) {
          return { ok: false, message: 'Codigo invalido. Confira o codigo enviado pelo lider.' }
        }

        try {
          const remoteState = await loadFutRankState(parsedCode.stateId)
          const group = normalizeGroup(remoteState?.state?.group)

          if (!group) {
            return { ok: false, message: 'Grupo nao encontrado.' }
          }

          const isAdminCode = parsedCode.role === 'admin' && parsedCode.normalizedCode === group.adminCode
          const isPlayerCode = parsedCode.role === 'player' && parsedCode.normalizedCode === group.playerCode

          if (!isAdminCode && !isPlayerCode) {
            return { ok: false, message: 'Codigo nao confere com este grupo.' }
          }

          await startCloudSession({
            stateId: parsedCode.stateId,
            role: isAdminCode ? 'admin' : 'player',
            accessCode: parsedCode.normalizedCode,
          })

          return { ok: true, group, role: isAdminCode ? 'admin' : 'player' }
        } catch (error) {
          return { ok: false, message: getCloudErrorMessage(error) }
        }
      },

      logout: () => {
        if (!isSupabaseConfigured) {
          return
        }

        clearAuthSession()
        activeCloudStateId = null
        cloudSyncStarted = false
        stopRemoteCloudSubscription()
        window.clearTimeout(cloudSaveTimer)

        isApplyingCloudState = true

        try {
          set((state) => ({
            ...state,
            ...emptyPersistedState(),
            auth: {
              ...state.auth,
              status: 'guest',
              role: null,
              groupId: null,
              groupName: null,
              groupStateId: null,
              accessCode: null,
              error: null,
            },
            sync: {
              ...state.sync,
              status: 'idle',
              message: 'Entre em um grupo para sincronizar',
              lastSyncedAt: null,
              error: null,
            },
          }))
        } finally {
          isApplyingCloudState = false
        }
      },

      addPlayer: (payload) => {
        const player = buildPlayer(payload)

        if (!player.nome) {
          return { ok: false, message: 'Informe o nome do jogador.' }
        }

        set((state) => ({
          players: [...state.players, player],
        }))

        return { ok: true, player }
      },

      deletePlayer: (playerId) => {
        set((state) => ({
          players: state.players.filter((player) => player.id !== playerId),
          evaluations: state.evaluations.filter(
            (evaluation) => evaluation.reviewerId !== playerId && evaluation.targetId !== playerId,
          ),
          teams: null,
        }))
      },

      updatePlayer: (playerId, payload) => {
        set((state) => ({
          players: state.players.map((player) => {
            if (player.id !== playerId) {
              return player
            }

            return buildPlayer({
              ...player,
              ...payload,
              attributes: payload.attributes ?? player.attributes,
              stats: payload.stats ?? player.stats,
            })
          }),
          teams: null,
        }))
      },

      togglePresence: (playerId) => {
        set((state) => ({
          players: state.players.map((player) => {
            if (player.id !== playerId) {
              return player
            }

            if (!canConfirmPresence(player)) {
              return buildPlayer({ ...player, presenceConfirmed: false })
            }

            return buildPlayer({ ...player, presenceConfirmed: !player.presenceConfirmed })
          }),
          teams: null,
        }))
      },

      setPaymentStatus: (playerId, pagamentoStatus) => {
        set((state) => ({
          players: state.players.map((player) => {
            if (player.id !== playerId) {
              return player
            }

            return buildPlayer({
              ...player,
              pagamentoStatus,
              presenceConfirmed: pagamentoStatus === 'paid' ? player.presenceConfirmed : false,
            })
          }),
          teams: null,
        }))
      },

      toggleBlocked: (playerId) => {
        set((state) => ({
          players: state.players.map((player) => {
            if (player.id !== playerId) {
              return player
            }

            const blocked = !player.blocked

            return buildPlayer({
              ...player,
              blocked,
              presenceConfirmed: blocked ? false : player.presenceConfirmed,
            })
          }),
          teams: null,
        }))
      },

      setEvaluationsOpen: (evaluationsOpen) => {
        set((state) => ({
          session: {
            ...state.session,
            evaluationsOpen,
            updatedAt: new Date().toISOString(),
          },
        }))
      },

      hasEvaluation: (reviewerId, targetId) => {
        return get().evaluations.some(
          (evaluation) => evaluation.reviewerId === reviewerId && evaluation.targetId === targetId,
        )
      },

      submitEvaluation: (reviewerId, targetId, ratings) => {
        const state = get()

        if (!state.session.evaluationsOpen) {
          return { ok: false, message: 'As avaliacoes estao fechadas.' }
        }

        if (!reviewerId || !targetId) {
          return { ok: false, message: 'Selecione avaliador e jogador avaliado.' }
        }

        if (reviewerId === targetId) {
          return { ok: false, message: 'O jogador nao pode avaliar a si mesmo.' }
        }

        if (state.evaluations.some((evaluation) => evaluation.reviewerId === reviewerId && evaluation.targetId === targetId)) {
          return { ok: false, message: 'Esse jogador ja avaliou este atleta.' }
        }

        const target = state.players.find((player) => player.id === targetId)

        if (!target) {
          return { ok: false, message: 'Jogador avaliado nao encontrado.' }
        }

        const evaluation = {
          id: crypto.randomUUID(),
          reviewerId,
          targetId,
          ratings,
          createdAt: new Date().toISOString(),
        }

        set((currentState) => ({
          evaluations: [...currentState.evaluations, evaluation],
          players: currentState.players.map((player) => {
            if (player.id !== targetId) {
              return player
            }

            return applyEvaluationToPlayer(player, ratings)
          }),
          teams: null,
        }))

        return { ok: true, evaluation }
      },

      generateTeams: () => {
        const teams = {
          ...balanceTeams(get().players),
          generatedAt: new Date().toISOString(),
        }

        set({ teams })
        return teams
      },

      rebalanceTeams: () => {
        const teams = {
          ...balanceTeams(get().players, { shuffleTies: true }),
          generatedAt: new Date().toISOString(),
        }

        set({ teams })
        return teams
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedState(persistedState),
      }),
      partialize: (state) => ({
        group: state.group,
        players: state.players,
        evaluations: state.evaluations,
        session: state.session,
        teams: state.teams,
      }),
    },
  ),
)
