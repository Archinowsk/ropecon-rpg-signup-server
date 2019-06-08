/* @flow */
import logger from 'utils/logger'
import getRandomInt from 'player-assignment/utils/getRandomInt'
import shuffleArray from 'utils/shuffleArray'
import type { User } from 'flow/user.flow'
import type { Game } from 'flow/game.flow'
import type { Result } from 'flow/result.flow'

type UserArray = Array<User>

type AssignmentResult = {
  score: number,
  signupResults: Array<Result>,
  playerCounter: number,
  gameCounter: number,
}

const runAssignment = (
  playerGroups: Array<UserArray>,
  signedGames: Array<Game>
): AssignmentResult => {
  const signupResults = []
  let matchingGroups = []
  let selectedGroups = []
  let score = 0
  let playerCounter = 0
  let gameCounter = 0

  const findEnteredGame = (enteredGame, signedGames) => {
    return signedGames.find(
      signedGame => signedGame.gameDetails.gameId === enteredGame.gameId
    )
  }

  // Shuffle games order
  const shuffledGames = shuffleArray(signedGames)

  for (let selectedGame of shuffledGames) {
    for (let playerGroup of playerGroups) {
      // Get groups with specific game signup
      // Always use first player in group
      playerGroup[0].signedGames.forEach(signedGame => {
        if (signedGame.gameDetails.gameId === selectedGame.gameId) {
          matchingGroups.push(playerGroup)
        }
      })
    }

    // Number of matching players
    const playersCount = matchingGroups.reduce(
      (acc, matchingGroup) => acc + matchingGroup.length,
      0
    )

    logger.debug(
      `Found ${matchingGroups.length} groups with ${playersCount} players for game "${selectedGame.title}", ${selectedGame.minAttendance}-${selectedGame.maxAttendance} players required`
    )

    // Not enough interested players, game will not happen
    if (playersCount < selectedGame.minAttendance) {
      logger.debug(
        `Not enough players for game "${selectedGame.title}" (signed: ${playersCount}, required: ${selectedGame.minAttendance}-${selectedGame.maxAttendance})`
      )
      break
    }

    // Maximum number of players is either game's limit or number of interested players
    const maximumPlayers = Math.min(selectedGame.maxAttendance, playersCount)

    let numberOfPlayers = 0
    let counter = 0
    const counterLimit = 10

    while (numberOfPlayers < maximumPlayers) {
      // Randomize group to enter the game
      let groupNumber = getRandomInt(0, matchingGroups.length - 1)
      const selectedGroup = matchingGroups[groupNumber]

      if (selectedGroup.length === 1) {
        logger.debug(`Selected player: ${selectedGroup[0].username} `)
      } else {
        logger.debug(
          `Selected group ${selectedGroup[0].playerGroup} with ${selectedGroup.length} players`
        )
      }

      // Enough seats remaining for the game
      if (numberOfPlayers + selectedGroup.length <= maximumPlayers) {
        numberOfPlayers += selectedGroup.length

        selectedGroups.push(selectedGroup)

        // Remove selected group from MATCHING groups array
        matchingGroups = matchingGroups.filter(
          remainingGroup =>
            remainingGroup[0].username !== selectedGroup[0].username
        )

        const seatsRemaining = maximumPlayers - numberOfPlayers
        logger.debug(`Seats remaining: ${seatsRemaining}`)
      }
      // Not enought seats remaining for the game
      else {
        counter += 1
        logger.debug(`No match, increase counter: ${counter}/${counterLimit}`)
        if (counter >= counterLimit) {
          logger.debug(`Limit reached, stop loop`)
          break
        }
      }
    }

    // Check if game has enough signups
    if (numberOfPlayers < selectedGame.minAttendance) {
      // Not enought signups, game will not happen
      logger.debug(
        `Not enough signups for game "${selectedGame.title}" (signed: ${playersCount}, assigned: ${numberOfPlayers}, required: ${selectedGame.minAttendance}-${selectedGame.maxAttendance})`
      )
    } else {
      // Enough signups, game will happen
      // Store results for selected groups
      for (let selectedGroup of selectedGroups) {
        for (let groupMember of selectedGroup) {
          let signedGame = groupMember.signedGames.find(
            signedGame => signedGame.gameDetails.gameId === selectedGame.gameId
          )

          // Increase score based on priority of the entered game
          if (signedGame && signedGame.priority === 1) {
            score += 3
          } else if (signedGame && signedGame.priority === 2) {
            score += 2
          } else if (signedGame && signedGame.priority === 3) {
            score += 1
          }

          playerCounter += 1

          let enteredGame = findEnteredGame(
            selectedGame,
            groupMember.signedGames
          )

          if (!enteredGame)
            throw new Error('Unable to find entered game from signed games')

          signupResults.push({
            username: groupMember.username,
            enteredGame,
            signedGames: groupMember.signedGames,
          })
        }
      }

      // Remove selected groups from ALL groups array
      playerGroups = playerGroups.filter(remainingGroup => {
        for (let selectedGroup of selectedGroups) {
          if (remainingGroup[0].username === selectedGroup[0].username) {
            return undefined
          }
        }
        return remainingGroup
      })

      gameCounter += 1
    }

    logger.debug(`${playerGroups.length} player groups remaining`)

    // Clear selections
    matchingGroups = []
    selectedGroups = []

    logger.debug(`**************`)
  }

  return {
    score,
    signupResults,
    playerCounter,
    gameCounter,
  }
}

export default runAssignment
