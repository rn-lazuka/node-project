const express = require('express')
const router = express.Router()
const { Order } = require('../models/order')

router.get('/', async (req, res) => {
    const productList = await Order.find()
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})

module.exports = router;
