const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');
const moment = require('moment')

const loadCoupon = async (req, res) => {
    try {
        const allCoupon = await Coupon.find()
        res.render('coupon', { allCoupon: allCoupon, moment })
    } catch (error) {
        console.log(error);
    }
}

const loadAddCoupon = async (req, res) => {
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error);
    }
}


const addCoupon = async (req, res) => {
    try {
        const { name, adate, edate, limit, damount } = req.body
        const firstName = name.split('').splice(1, 3).join('')
        const randomString = Math.random().toString(36).substring(2, 7)
        const randomNumber = `${Math.floor(1000 + Math.random() * 9000)}`
        const existName = await Coupon.findOne({ name: name })
        if (existName) {
            req.flash('exists', 'This Coupon is already exist')
            res.redirect('/admin/addCoupon')
        } else {
            const newCoupon = new Coupon({
                name: name,
                couponCode: `${firstName}${randomString}${randomNumber}`,
                activationDate: adate,
                expiryDate: edate,
                limitOfUse: limit,
                discountAmount: damount,

            })
            await newCoupon.save()
            res.redirect('/admin/coupon')
        }

    } catch (error) {
        console.log(error);
    }
}


const listCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.findOne({ _id: req.query.id })
        if (coupons.status == true) {
            await Coupon.updateOne({ _id: req.query.id }, { $set: { status: false } })
        } else {
            await Coupon.updateOne({ _id: req.query.id }, { $set: { status: true } })
        }
        res.json({ success: true })

    } catch (error) {
        res.redirect('/500')


    }
}

const loadEditCoupon = async (req, res) => {
    try {
        const couponData = await Coupon.findOne({ _id: req.query.id })
        console.log("id", req.query.id);
        res.render('editCoupon', { coupon: couponData, moment });
    } catch (error) {
        console.log(error);
    }
}


const editCoupon = async (req, res) => {
    try {
        const { id, name, adate, edate, limit, damount } = req.body;

        const existCoupon = await Coupon.findOne({ _id: { $ne: id }, name: name });

        if (existCoupon) {
            res.render('editCoupon', {
                error: "Coupon with this name already exists!",
                coupon: { name: name, activationDate: adate, expiryDate: edate, limitOfUse: limit, discountAmount: damount }
            });
        } else {
            await Coupon.updateOne({ _id: id }, {
                $set: {
                    name: name,
                    activationDate: adate,
                    expiryDate: edate,
                    limitOfUse: limit,
                    discountAmount: damount
                }
            });
            res.redirect('/admin/coupon');
        }
    } catch (error) {
        console.log(error);
    }
}


const applyCoupon = async (req, res) => {

    try {
        const userId = req.session.userId
        const couponCode = req.body.couponCode;
        const total = Number(req.body.total);
        console.log(couponCode,total);
        const coupon = await Coupon.findOne({ couponCode:couponCode })
        console.log(coupon);

        if(coupon){
            const alreadyUsed = coupon.userUsed.find((user)=>user.userId == userId)

            if(!alreadyUsed){
                let currentDate = new Date()
                if(coupon.expiryDate >= currentDate){
                    const totalAmount = total
                    if( total>coupon.limitOfUse ){
                        const discountPercent = parseFloat(coupon.discountAmount)/100
                        const discountAmount = totalAmount*discountPercent
                        const discountedTotal = Math.round(totalAmount - discountAmount)

                        res.json({ amountOkey:true, discountAmount, discountedTotal })

                    }else{
                        res.json({ min: true, message: 'minimum amount needed' })
                    }
                }else{
                    res.json({ expired: true, message: 'this coupon is expired' })
                }

            }else{
                res.json({ alreadyUsed: true, message: 'this coupon already used' })
            }

        }else{
            res.json({ notAvailable: true, message: 'coupon is not available ' })

        }
    } catch (error) {
        console.log(error);
    }


























    // try {
    //     const cCode = req.body.couponCode
    //     const userId = req.session.userId
    //     const couponCode = await Coupon.findOne({ couponCode: cCode })
    //     const cartData = await Cart.findOne({ userId: userId })
    //     if (couponCode) {
    //         const alreadyUsed = couponCode.userUsed.find((user) => user.userId === userId)
    //         if (!alreadyUsed) {
    //             let currentDate = new Date()
    //             if (couponCode.expiryDate > currentDate) {
    //                 const total = cartData.products.reduce((acc, value) => acc + value.totalPrice, 0)
    //                 if (total >= couponCode.limitOfUse) {
    //                     let discount = 0
    //                     let cartAmount = 0
    //                     if (couponCode.discountAmount) {
    //                         let discAmt = total * (couponCode.discountAmount / 100);
    //                         let dics = discAmt / cartData.products.length
    //                         discount = Math.round(dics)
    //                         cartAmount = cartData.products.reduce((acc, value) => {
    //                             if (value.totalPrice >= discount) {
    //                                 return acc += (value.totalPrice - discount)
    //                             } else {
    //                                 return acc += value.totalPrice
    //                             }
    //                         }, 0)
    //                     }
    //                     res.json({ success: true, subTotal: cartAmount })
    //                 } else {
    //                     res.json({ min: true, message: 'minimum amount needed' })
    //                 }
    //             } else {
    //                 res.json({ expired: true, message: 'this coupon is expired' })
    //             }
    //         } else {
    //             res.json({ alreadyUsed: true, message: 'this coupon already used' })
    //         }
    //     } else {
    //         res.json({ notAvailable: true, message: 'coupon is not available ' })
    //     }
    // } catch (error) {
    //     console.log(error);
    // }
}


module.exports = {
    loadCoupon,
    loadAddCoupon,
    addCoupon,
    listCoupon,
    loadEditCoupon,
    editCoupon,
    applyCoupon
}