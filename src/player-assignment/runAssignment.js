// @flow
import { logger } from 'utils/logger';
import { db } from 'db/mongodb';
import { config } from 'config';
import { runAssignmentStrategy } from 'player-assignment/utils/runAssignmentStrategy';
import type { PlayerAssignmentResult } from 'flow/result.flow';
import type { User } from 'flow/user.flow';
import type { Game } from 'flow/game.flow';
import type { AssignmentStrategy } from 'flow/config.flow';

export const runAssignment = async (
  startingTime: string,
  assignmentStrategy: AssignmentStrategy = config.assignmentStrategy
): Promise<PlayerAssignmentResult> => {
  let users: $ReadOnlyArray<User> = [];
  try {
    users = await db.user.findUsers();
  } catch (error) {
    throw new Error(`findUsers error: ${error}`);
  }

  let games: $ReadOnlyArray<Game> = [];
  try {
    games = await db.game.findGames();
  } catch (error) {
    logger.error(`findGames error: ${error}`);
    throw new Error(`findGames error: ${error}`);
  }

  let assignResults = null;
  try {
    assignResults = runAssignmentStrategy(
      users,
      games,
      startingTime,
      assignmentStrategy
    );
  } catch (error) {
    logger.error(`Player assign error: ${error}`);
    throw new Error(`Player assign error: ${error}`);
  }

  return assignResults;
};