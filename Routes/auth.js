const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const router = express.Router()

const Users = require('../Models/user.model')

//signup
router.post('/signup', async (req, res) => {
  try {
    const payload = req.body
    payload.hashedPassword = await bcrypt.hash(payload.password, 10)
    delete payload.password
    let user = new Users(payload) //creating mongoose object
    await user.save((err, data) => {
      if (err) {
        return res.status(400).send({
          message: ' User Already Exist .'
        })
      }
      return res.status(201).send({
        message: 'User has been registered successfully.',
        user: data
      })
    })
  } catch (err) {
    console.log('Error: ', err)
    return res.status(500).send({
      message: 'Internal Server Error'
    })
  }
})

// signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await Users.findOne({ email: email })
    console.log('Existing User: ', existingUser)
    if (existingUser) {
      const isValidUser = await bcrypt.compare(
        password,
        existingUser.hashedPassword
      ) //true or false
      console.log('IsValid:', isValidUser)
      if (isValidUser) {
        const token = jwt.sign(
          { _id: existingUser._id },
          process.env.SECRET_KEY
        )
        res.cookie('entryToken', token, {
          expires: new Date(Date.now() + 25892000000)
        })
        const { _id, name, email, role } = existingUser
        return res
          .status(200)
          .send({ token: token, user: { _id, email, name, role } })
      }
      return res.status(400).send({
        message: 'Email/Password are not matching.'
      })
    }
    return res.status(400).send({
      message: "User doesn't exist."
    })
  } catch (err) {
    return res.status(500).send({
      message: 'Internal Server Error'
    })
  }
})

// signout
router.get('/signout', async (req, res) => {
  await res.clearCookie('entryToken')

  return res.status(200).send({
    message: 'Successfully Signed out! '
  })
})

module.exports = router
