require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const { db } = require('./connection')
const authRoutes = require('./Routes/auth')

//Middlewares
db()
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello world !')
})

//Custom Middlewares
app.use('/api', authRoutes)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`App is Listening to the port ${PORT}`)
})
