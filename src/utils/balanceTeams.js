import { canEnterDraw } from './player.js'

function sumOverall(team) {
  return team.reduce((sum, player) => sum + Number(player.overall ?? 0), 0)
}

function averageOverall(team) {
  if (team.length === 0) {
    return 0
  }

  return Math.round((sumOverall(team) / team.length) * 10) / 10
}

function shuffleSameOverall(players) {
  return [...players].sort((a, b) => {
    const overallDiff = Number(b.overall ?? 0) - Number(a.overall ?? 0)

    if (overallDiff !== 0) {
      return overallDiff
    }

    return Math.random() - 0.5
  })
}

function sortByOverall(players, shuffleTies) {
  if (shuffleTies) {
    return shuffleSameOverall(players)
  }

  return [...players].sort((a, b) => {
    const overallDiff = Number(b.overall ?? 0) - Number(a.overall ?? 0)

    if (overallDiff !== 0) {
      return overallDiff
    }

    return a.nome.localeCompare(b.nome)
  })
}

function greedyBalance(players) {
  const timeA = []
  const timeB = []

  players.forEach((player) => {
    const countDiff = timeA.length - timeB.length

    if (countDiff > 0) {
      timeB.push(player)
      return
    }

    if (countDiff < 0) {
      timeA.push(player)
      return
    }

    if (sumOverall(timeA) <= sumOverall(timeB)) {
      timeA.push(player)
    } else {
      timeB.push(player)
    }
  })

  return { timeA, timeB }
}

function exhaustiveBalance(players) {
  const totalPlayers = players.length
  const totalMasks = 2 ** totalPlayers
  let bestMask = 0
  let bestDiff = Number.POSITIVE_INFINITY
  let bestSizeDiff = Number.POSITIVE_INFINITY

  for (let mask = 1; mask < totalMasks - 1; mask += 1) {
    let countA = 0
    let sumA = 0

    for (let index = 0; index < totalPlayers; index += 1) {
      if ((mask & (1 << index)) !== 0) {
        countA += 1
        sumA += Number(players[index].overall ?? 0)
      }
    }

    const countB = totalPlayers - countA
    const sizeDiff = Math.abs(countA - countB)

    if (sizeDiff > 1) {
      continue
    }

    const sumB = sumOverall(players) - sumA
    const overallDiff = Math.abs(sumA - sumB)

    if (overallDiff < bestDiff || (overallDiff === bestDiff && sizeDiff < bestSizeDiff)) {
      bestDiff = overallDiff
      bestSizeDiff = sizeDiff
      bestMask = mask
    }
  }

  const timeA = []
  const timeB = []

  players.forEach((player, index) => {
    if ((bestMask & (1 << index)) !== 0) {
      timeA.push(player)
    } else {
      timeB.push(player)
    }
  })

  return { timeA, timeB }
}

export function summarizeTeams(timeA, timeB) {
  return {
    somaA: sumOverall(timeA),
    somaB: sumOverall(timeB),
    mediaA: averageOverall(timeA),
    mediaB: averageOverall(timeB),
  }
}

export function balanceTeams(players, options = {}) {
  const eligiblePlayers = sortByOverall(players.filter(canEnterDraw), options.shuffleTies)

  if (eligiblePlayers.length === 0) {
    return {
      timeA: [],
      timeB: [],
      somaA: 0,
      somaB: 0,
      mediaA: 0,
      mediaB: 0,
      eligibleCount: 0,
    }
  }

  if (eligiblePlayers.length === 1) {
    return {
      timeA: [eligiblePlayers[0]],
      timeB: [],
      somaA: Number(eligiblePlayers[0].overall ?? 0),
      somaB: 0,
      mediaA: Number(eligiblePlayers[0].overall ?? 0),
      mediaB: 0,
      eligibleCount: 1,
    }
  }

  const balanced = eligiblePlayers.length <= 18 ? exhaustiveBalance(eligiblePlayers) : greedyBalance(eligiblePlayers)
  const summary = summarizeTeams(balanced.timeA, balanced.timeB)

  return {
    ...balanced,
    ...summary,
    eligibleCount: eligiblePlayers.length,
  }
}
