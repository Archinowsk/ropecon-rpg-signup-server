const { logger } = require('../../utils/logger')
const db = require('../../db/mongodb')
const validateAuthHeader = require('../../utils/authHeader')

// Add open signup time to server settings
const postSignupTime = (req, res) => {
  logger.info('API call: POST /api/signuptime')
  const signupTime = req.body.signupTime

  const authHeader = req.headers.authorization
  const validToken = validateAuthHeader(authHeader, 'admin')

  if (!validToken) {
    res.json({
      code: 401,
      message: 'Unauthorized',
      status: 'error',
    })
  }

  return db.storeSignupTime(signupTime).then(
    () => {
      res.json({
        message: 'Signup time set success',
        status: 'success',
      })
    },
    error => {
      res.json({
        message: 'Signup time set failure',
        status: 'error',
        error,
      })
    }
  )
}

module.exports = { postSignupTime }