export const POSITIONS = ['GOL', 'ZAG', 'MEI', 'ATA']

export const ATTRIBUTES = [
  { key: 'PAC', label: 'PAC' },
  { key: 'PAS', label: 'PAS' },
  { key: 'FIN', label: 'FIN' },
  { key: 'DEF', label: 'DEF' },
  { key: 'PHY', label: 'PHY' },
]

const POSITION_WEIGHTS = {
  ATA: { FIN: 0.34, PAC: 0.28, PAS: 0.16, PHY: 0.14, DEF: 0.08 },
  MEI: { PAS: 0.36, PAC: 0.2, FIN: 0.18, PHY: 0.14, DEF: 0.12 },
  ZAG: { DEF: 0.38, PHY: 0.28, PAS: 0.14, PAC: 0.12, FIN: 0.08 },
  GOL: { DEF: 0.42, PHY: 0.3, PAS: 0.12, PAC: 0.1, FIN: 0.06 },
}

export const DEFAULT_ATTRIBUTES = {
  PAC: 60,
  PAS: 60,
  FIN: 60,
  DEF: 60,
  PHY: 60,
}

export function clampRating(value) {
  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return 0
  }

  return Math.min(99, Math.max(0, Math.round(numberValue)))
}

export function normalizeAttributes(attributes = {}) {
  return ATTRIBUTES.reduce((result, attribute) => {
    result[attribute.key] = clampRating(attributes[attribute.key] ?? DEFAULT_ATTRIBUTES[attribute.key])
    return result
  }, {})
}

export function calculateOverall(player) {
  const position = player?.position && POSITION_WEIGHTS[player.position] ? player.position : 'MEI'
  const attributes = normalizeAttributes(player?.attributes)
  const weights = POSITION_WEIGHTS[position]

  const weightedTotal = ATTRIBUTES.reduce((total, attribute) => {
    return total + attributes[attribute.key] * weights[attribute.key]
  }, 0)

  return clampRating(weightedTotal)
}

export function buildPlayer(payload) {
  const player = {
    id: payload.id ?? crypto.randomUUID(),
    nome: String(payload.nome ?? '').trim(),
    position: payload.position ?? 'MEI',
    attributes: normalizeAttributes(payload.attributes),
    presenceConfirmed: Boolean(payload.presenceConfirmed),
    pagamentoStatus: payload.pagamentoStatus ?? 'pending',
    blocked: Boolean(payload.blocked),
    avaliacoesRecebidas: Number(payload.avaliacoesRecebidas ?? 0),
    stats: {
      vitorias: Number(payload.stats?.vitorias ?? 0),
      derrotas: Number(payload.stats?.derrotas ?? 0),
      mvps: Number(payload.stats?.mvps ?? 0),
    },
  }

  return {
    ...player,
    overall: calculateOverall(player),
  }
}

export function canConfirmPresence(player) {
  return !player.blocked && player.pagamentoStatus === 'paid'
}

export function canEnterDraw(player) {
  return Boolean(player.presenceConfirmed) && canConfirmPresence(player)
}

export function applyEvaluationToPlayer(player, ratings) {
  const currentAttributes = normalizeAttributes(player.attributes)
  const nextEvaluationCount = Number(player.avaliacoesRecebidas ?? 0) + 1
  const baselineWeight = 3
  const nextAttributes = ATTRIBUTES.reduce((result, attribute) => {
    const key = attribute.key
    const rating = clampRating(ratings[key] ?? currentAttributes[key])
    const weightedAverage = (currentAttributes[key] * (baselineWeight + nextEvaluationCount - 1) + rating) / (baselineWeight + nextEvaluationCount)
    result[key] = clampRating(weightedAverage)
    return result
  }, {})

  return buildPlayer({
    ...player,
    attributes: nextAttributes,
    avaliacoesRecebidas: nextEvaluationCount,
  })
}

export function playerStatusLabel(player) {
  if (player.blocked) {
    return 'Bloqueado'
  }

  if (player.pagamentoStatus !== 'paid') {
    return 'Pagamento pendente'
  }

  return player.presenceConfirmed ? 'Presente' : 'Liberado'
}
