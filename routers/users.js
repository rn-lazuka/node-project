const express = require('express')
const router = express.Router()
const {User} = require('../models/user')
const bcrypt = require('bcryptjs')
const {Category} = require("../models/category");

router.get('/', async (req, res) => {
    const productList = await User.find().select('-passwordHash')
    if (!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList)
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash')
    if (!user) {
        res.status(500).json({
            message: 'The user with given ID was not found!',
        })
    }
    res.status(200).send(user)
})

router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
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
