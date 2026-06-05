function formatPlayer(player) {
  return `${player.nome} (${player.position}) - OVR ${player.overall}`
}

export function formatTeamsForWhatsApp(teams) {
  if (!teams || teams.eligibleCount === 0) {
    return 'FutRank - Times da Pelada\n\nNenhum jogador elegivel para o sorteio.'
  }

  const timeA = teams.timeA.map(formatPlayer).map((line) => `- ${line}`).join('\n')
  const timeB = teams.timeB.map(formatPlayer).map((line) => `- ${line}`).join('\n')

  return [
    'FutRank - Times da Pelada',
    '',
    `Time A | media ${teams.mediaA} | soma ${teams.somaA}`,
    timeA || '- Sem jogadores',
    '',
    `Time B | media ${teams.mediaB} | soma ${teams.somaB}`,
    timeB || '- Sem jogadores',
  ].join('\n')
}
