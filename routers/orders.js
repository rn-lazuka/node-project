const express = require('express')
const router = express.Router()
const { Order } = require('../models/order')
const { OrderItem } = require('../models/order-item')
const { Category } = require('../models/category')
const { User } = require('../models/user')

router.get('/', async (req, res) => {
    const orderList = await Order.find()
        .populate('user', 'name')
        .sort({ dateOrder: -1 })
    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList)
})

router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category',
            },
        })

    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order)
})

router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            })
            newOrderItem = await newOrderItem.save()
            return newOrderItem._id
        })
    )

    const orderItemsIdsResolved = await orderItemsIds

    const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate(
                'product',
                'price'
            )
            return orderItem.product.price * orderItem.quantity
        })
    )

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice,
        user: req.body.user,
        dateOrder: req.body.dateOrder,
    })
    order = await order.save()
    !order
        ? res.status(404).send('the order cannot be created!')
        : res.send(order)
})

router.put('/:id', async (req, res) => {
    let order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    )

    !order
        ? res.status(404).send('Can not find order with such ID!')
        : res.send(order)
})

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id)
        if (order) {
            await order.orderItems.map(async (orderItem) => {
                await OrderItem.findByIdAndDelete(orderItem._id)
            })
            return res
                .status(200)
                .json({ status: true, message: 'the order is deleted!' })
        }
        return res
            .status(404)
            .json({ status: false, message: 'order not found!' })
    } catch (error) {
        res.status(400).json({ status: false, error })
    }
})

router.get(`/get/totalsales`, async (req, res) => {
    const totalSales = await Order.aggregate([
        {
            $group: { _id: null, totalSales: { $sum: '$totalPrice' } },
        },
    ])
    if (!totalSales) {
        res.status(400).json({
            success: false,
            message: 'The order sales can not be generated!',
        })
    }
    res.status(200).send({ totalSales: totalSales.pop().totalSales })
})

router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments()
    if (!orderCount) {
        res.status(500).json({ success: false, message: 'no orders' })
    }
    res.status(200).json({ total: orderCount })
})

router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({
        user: req.params.userid,
    }).populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            populate: 'category',
        }
    }).sort({ dateOrder: -1 })
    if (!userOrderList) {
        res.status(500).json({ success: false, message: 'no orders' })
    }
    res.status(200).send(userOrderList)
})

module.exports = router
