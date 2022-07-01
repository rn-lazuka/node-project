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

router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: req.body.passwordHash,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    })
    user = await user.save()
    !user
        ? res.status(404).send('the user cannot be created!')
        : res.send(user)
})

module.exports = router;
