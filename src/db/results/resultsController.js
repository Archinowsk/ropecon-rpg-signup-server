const moment = require('moment')
const { logger } = require('../../utils/logger')
const Results = require('./resultsSchema')

const removeResults = () => {
  logger.info('MongoDB: remove ALL results from db')
  return Results.remove({})
}
const getResultsData = async () => {
  let response = null
  try {
    response = await Results.find({})
    logger.info(`MongoDB: Results data found`)
    return response
  } catch (error) {
    logger.error(`MongoDB: Error finding results data - ${error}`)
    return error
  }
}

const storeAllSignupResults = async (signupResultData, startingTime) => {
  const formattedTime = moment.utc(startingTime)

  // Example user data
  const results = new Results({
    result: signupResultData,
    time: formattedTime,
  })

  // Save to database
  let response = null
  try {
    response = await results.save()
    logger.info(`MongoDB: Signup results stored to separate collection`)
    return response
  } catch (error) {
    logger.error(
      `MongoDB: Error storing signup results to separate collection - ${error}`
    )
    return error
  }
}

module.exports = {
  removeResults,
  storeAllSignupResults,
  getResultsData,
}