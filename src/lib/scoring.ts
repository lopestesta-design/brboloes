type ScoringConfig = { exact: number; result: number; wrong: number }

export function calcularPontos(
  homeReal: number,
  awayReal: number,
  homePalpite: number,
  awayPalpite: number,
  config: ScoringConfig = { exact: 5, result: 3, wrong: 0 }
): number {
  if (homePalpite === homeReal && awayPalpite === awayReal) return config.exact

  const realWinner = homeReal > awayReal ? "home" : awayReal > homeReal ? "away" : "draw"
  const palpiteWinner = homePalpite > awayPalpite ? "home" : awayPalpite > homePalpite ? "away" : "draw"

  if (realWinner === palpiteWinner) return config.result

  return config.wrong
}
