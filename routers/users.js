const express = require('express')
const router = express.Router()
const { User } = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.get('/', async (req, res) => {
    const productList = await User.find().select('-passwordHash')
    if (!productList) {
        res.status(500).json({ success: false })
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
    !user ? res.status(404).send('the user cannot be created!') : res.send(user)
})

router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret
    if (!user) {
        return res.status(400).send('The user not found!')
    }
    if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )

        res.status(200).send({ user: user.email, token })
    } else {
        res.status(400).send('Password is wrong!')
    }
})

module.exports = router
