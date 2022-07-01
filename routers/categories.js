const express = require('express')
const router = express.Router()
const { Category } = require('../models/category')

router.get('/', async (req, res) => {
    const categoryList = await Category.find()
    if (!categoryList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(categoryList)
})

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id)
    if (!category) {
        res.status(500).json({
            message: 'The category with given ID was not found!',
        })
    }
    res.status(200).send(category)
})

router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })

    category = await category.save()

    !category
        ? res.status(404).send('the category cannot be created!')
        : res.send(category)
})

router.put('/:id', async (req, res) => {
    let category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true }
    )

    !category
        ? res.status(404).send('the category cannot be created!')
        : res.send(category)
})

router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id)
        !category
            ? res
                  .status(404)
                  .json({ status: false, message: 'category not found!' })
            : res
                  .status(200)
                  .json({ status: true, message: 'the category is deleted!' })
    } catch (error) {
        res.status(400).json({ status: false, error })
    }
})

module.exports = router
