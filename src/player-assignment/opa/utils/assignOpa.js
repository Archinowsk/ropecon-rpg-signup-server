/* @flow */
import eventassigner from 'eventassigner-js'
import _ from 'lodash'
import { logger } from 'utils/logger'
import { config } from 'config'
import { calculateHappiness } from 'player-assignment/opa/utils/calculateHappiness'
import type {
  Input,
  ListItem,
  Group,
  Event,
  OpaAssignResults,
} from 'flow/opaAssign.flow'

export const assignOpa = (
  groups: Array<Group>,
  events: Array<Event>,
  list: Array<ListItem>,
  updateL: Function
): OpaAssignResults => {
  const { OPA_ASSIGNMENT_ROUNDS } = config

  let finalHappiness = 0
  let finalAssignResults: OpaAssignResults = []

  const sortList = (list: Array<ListItem>, i: number) => {
    switch (i) {
      case 0:
        return _.sortBy(list, 'gain')
      case 1:
        return _.sortBy(list, 'size')
      default:
        return list.sort((a, b) => 0.5 - Math.random())
    }
  }

  for (let i = 0; i < OPA_ASSIGNMENT_ROUNDS; i++) {
    const eventsCopy = _.cloneDeep(events)

    const input: Input = {
      groups,
      events: eventsCopy,
      list: sortList(list, i),
      updateL,
    }

    const assignResults: OpaAssignResults = eventassigner.eventAssignment(input)

    const happiness = calculateHappiness(assignResults, groups)

    if (happiness > finalHappiness) {
      finalHappiness = happiness
      finalAssignResults = assignResults
    }
  }

  logger.info(`Opa assignment completed with happiness ${finalHappiness}%`)

  return finalAssignResults
}
