const express = require("express")
const path = require("path")
const app = express()

app.use(express.json())

const viewRouter = require('./routes/viewRoutes')

const registrationDetailsRouter = require('./routes/registrationRoutes')
// const cookieParser = require('cookie-parser')
// app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'views')))

app.use('/api/v1/registrationDetails', registrationDetailsRouter)
app.use('/', viewRouter)

module.exports=app;