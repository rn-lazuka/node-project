require('dotenv/config')
const morgan = require('morgan')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

//middleware
app.use(bodyParser.json())
app.use(morgan('tiny'))

const productSchema = mongoose.Schema({
    name: String,
    image: String,
    stock: {
        type: Number,
        required: true,
    },
})

const Product = mongoose.model('Product', productSchema)

const api = process.env.API_URL

app.get('/', async (req, res) => {
    res.send('Hello api!')
})

app.get(`${api}/products`, async (req, res) => {
    const productList = await Product.find()
    res.send(productList)
})

app.post(`${api}/products`, (req, res) => {
    const product = new Product({
        name: req.body.name,
        image: req.body.image,
        stock: req.body.stock,
    })
    product
        .save()
        .then((createdProduct) => {
            res.status(201).json(createdProduct)
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
                success: false,
            })
        })
})

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
