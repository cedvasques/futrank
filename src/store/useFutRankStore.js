import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { applyEvaluationToPlayer, buildPlayer, canConfirmPresence } from '../utils/player'
import { balanceTeams } from '../utils/balanceTeams'

const STORAGE_KEY = 'futrank-storage-v1'

function normalizePersistedState(state) {
  return {
    players: Array.isArray(state?.players) ? state.players.map(buildPlayer) : [],
    evaluations: Array.isArray(state?.evaluations) ? state.evaluations : [],
    session: {
      evaluationsOpen: Boolean(state?.session?.evaluationsOpen),
      updatedAt: state?.session?.updatedAt ?? null,
    },
    teams: state?.teams ?? null,
  }
}

export const useFutRankStore = create(
  persist(
    (set, get) => ({
      players: [],
      evaluations: [],
      session: {
        evaluationsOpen: false,
        updatedAt: null,
      },
      teams: null,

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
        players: state.players,
        evaluations: state.evaluations,
        session: state.session,
        teams: state.teams,
      }),
    },
  ),
)
