const express = require('express')
const router = express.Router()
const {Product} = require('../models/product')
const {Category} = require('../models/category')
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')
        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}${Date.now()}.${extension}`)
    },
})

const upload = multer({storage: storage})

router.get('/', async (req, res) => {
    let filter = {}
    if (req.query.categories) {
        filter = {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter)
        // .select('name image -_id')
        .populate('category')
    if (!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList)
})

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')
    if (!product) {
        res.status(500).json({
            success: false,
            message: 'The product with given ID was not found!',
        })
    }
    res.status(200).send(product)
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments()
    if (!productCount) {
        res.status(500).json({success: false, message: 'no products'})
    }
    res.status(200).json({total: productCount})
})

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ?? 0
    const product = await Product.find({isFeatured: true}).limit(count)
    if (!product) {
        res.status(500).json({success: false, message: 'no products'})
    }
    res.status(200).json({total: product})
})

router.post('/', upload.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) res.status(400).send('invalid category!')

    const file = req.file
    if (!file) res.status(400).send('no images in the request!')

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })
    product = await product.save()
    !product
        ? res.status(404).send('the product cannot be created!')
        : res.send(product)
})

router.put('/:id',  upload.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('invalid product id!')
    }
    const category = await Category.findById(req.body.category)

    if (!category) res.status(400).send('invalid category!')

    const file = req.file
    if (!file) res.status(400).send('no images in the request!')

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    let product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: `${basePath}${fileName}`,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {new: true}
    )

    !product
        ? res.status(404).send('Can not find product with such ID!')
        : res.send(product)
})

router.put(
    '/gallery-images/:id',
    upload.array('images', 10),
    async (req, res) => {
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        const {files} = req
        let imagesPaths = []
        if (files) {
            files.map(file => {
                imagesPaths.push(`${basePath}${file.filename}`)
            })
        }

        let product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            {new: true}
        )

        !product
            ? res.status(404).send('Can not find product with such ID!')
            : res.send(product)
    }
)

router.delete('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('invalid product id!')
    }
    try {
        const product = await Product.findByIdAndRemove(req.params.id)
        !product
            ? res
                .status(404)
                .json({status: false, message: 'product not found!'})
            : res
                .status(200)
                .json({status: true, message: 'the product is deleted!'})
    } catch (error) {
        res.status(400).json({status: false, error})
    }
})

module.exports = router
