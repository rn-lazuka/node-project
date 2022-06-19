const express = require('express')
const router = express.Router()
const { User } = require('../models/user')

router.get('/', async (req, res) => {
    const productList = await User.find()
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})

module.exports = router;
