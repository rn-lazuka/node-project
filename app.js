require('dotenv/config')
const morgan = require('morgan')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const api = process.env.API_URL

const productsRouter = require('./routers/products')
const categoriesRouter = require('./routers/categories')
const ordersRouter = require('./routers/orders')
const usersRouter = require('./routers/users')
const cors = require('cors')
const authJwt = require('./helpers/jwt');
const errorHandler = require("./helpers/error-handler");

app.use(cors())
app.options('*', cors())

//middleware
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)

//routers
app.get('/', async (req, res) => {
    res.send('Hello api!')
})
app.use(`${api}/products`, productsRouter)
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/orders`, ordersRouter)
app.use(`${api}/users`, usersRouter)

mongoose
    .connect(process.env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log('db connection is ready')
    })
    .catch((error) => {
        console.log(error)
    })

app.listen(3000, () => {
    console.log('app listening on port 3000')
})
