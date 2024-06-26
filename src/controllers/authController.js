const bcrypt = require('bcryptjs')
const { generateTokens } = require('../utils/jwt')
const { v4: uuidv4 } = require('uuid')
const { response } = require('../utils/middleware')
const authService = require('../services/authService')
const userService = require('../services/userService')

// For firebases
const admin = require('firebase-admin')
admin.initializeApp({
  credential: admin.credential.applicationDefault()
})

const auth = admin.auth()

const login = async (req, res, next) => {
  try {
    let existingUser
    let createdUser

    if (req.body.signInByGoogle) {
      const decodedToken = await auth.verifyIdToken(req.body.googleAuthToken)
      const { email, name } = decodedToken

      existingUser = await userService.findUserByEmail(email)
      if (!existingUser) {
        createdUser = await authService.createUser({
          email,
          fullName: name,
          signedByGoogle: true
        })
      }
    } else {
      const { email, password } = req.body
      if (!email || !password) {
        return response(res, 400, 'You must provide an email and a password.')
      }

      existingUser = await userService.findUserByEmail(email)
      if (!existingUser) {
        return response(res, 404, 'You are not registered!')
      }

      const isMatch = await bcrypt.compare(password, existingUser.password)
      if (!isMatch) {
        return response(res, 400, 'Your email or password is incorrect!')
      }
    }

    const jti = uuidv4()
    const user = existingUser || createdUser
    const { accessToken, refreshToken } = generateTokens(user, jti)
    const hashedToken = await bcrypt.hash(refreshToken, 10)

    await authService.createToken({ id: jti, hashedToken, userId: user.id })

    response(res, 200, 'Login successful', {
      userId: user.id,
      fullName: user.fullName,
      accessToken,
      refreshToken
    })
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

const logout = (req, res, next) => {
  try {
    response(res, 200, 'Logout successful')
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body

    const userMatch = await userService.findUserByEmail(email)
    if (userMatch) {
      return response(res, 400, 'Email already registered!')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await authService.createUser({
      username,
      email,
      password: hashedPassword,
      fullName
    })

    const jti = uuidv4()
    const { refreshToken } = generateTokens(user, jti)
    const hashedToken = await bcrypt.hash(refreshToken, 10)

    await authService.createToken({ id: jti, hashedToken, userId: user.id })

    response(res, 201, 'User registered successfully', { user })
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { userId } = req.user
    const { newPassword } = req.body

    const user = await userService.findUserById(userId)
    if (!user) {
      return response(res, 403, 'User not found')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await authService.updateUserPassword(user, hashedPassword)

    response(res, 200, 'Password has been reset')
  } catch (error) {
    response(res, 500, 'Internal Server Error', { error: error.message })
    console.log(error)
    next(error)
  }
}

module.exports = { login, logout, register, resetPassword }
