/**
 * Calculates vote counts from a votes record.
 * @param votes - Record mapping voterId to votedPlayerId
 * @returns Map of votedPlayerId to vote count
 */
export function calculateVoteCounts(
  votes: Record<string, string>
): Map<string, number> {
  const voteCounts = new Map<string, number>()
  for (const votedId of Object.values(votes)) {
    voteCounts.set(votedId, (voteCounts.get(votedId) ?? 0) + 1)
  }
  return voteCounts
}

/**
 * Finds the most voted player(s) and determines if there's a tie.
 * @param voteCounts - Map of playerId to vote count
 * @returns Object with mostVotedIds (array for ties), maxVotes, and isTie flag
 */
export function findMostVoted(
  voteCounts: Map<string, number>
): {
  mostVotedIds: string[]
  maxVotes: number
  isTie: boolean
} {
  if (voteCounts.size === 0) {
    return { mostVotedIds: [], maxVotes: 0, isTie: false }
  }

  let maxVotes = 0
  const mostVotedIds: string[] = []

  for (const [playerId, count] of voteCounts.entries()) {
    if (count > maxVotes) {
      maxVotes = count
      mostVotedIds.length = 0
      mostVotedIds.push(playerId)
    } else if (count === maxVotes && maxVotes > 0) {
      mostVotedIds.push(playerId)
    }
  }

  return {
    mostVotedIds,
    maxVotes,
    isTie: mostVotedIds.length > 1,
  }
}
