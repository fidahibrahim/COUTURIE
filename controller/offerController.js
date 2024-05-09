const Offer = require('../models/offerModel')
const category = require('../models/category');
const productModel = require('../models/productModel');
const moment = require('moment');


const loadOffer = async (req, res) => {
    try {
        const offers = await Offer.find({})
        res.render('offer', { offers, moment })
    } catch (error) {
        console.log(error);
    }
}

const addOffer = async (req, res) => {
    try {
        const { offerName, discountRate, startDate, endDate, offerType, selectedValues } = req.body
        console.log('req.body', req.body);
        if (!offerName || offerName.trim() == "") {
            return res.json({ success: false, message: "Please enter offer name" })
        }
        if (!discountRate || discountRate.trim() == "" || discountRate < 0 || discountRate > 80) {
            return res.json({ success: false, message: "Plase Enter a valid discount Amount" })
        }
        if (offerType == "Choose") {
            return res.json({ success: false, message: "Plase select offer type" })
        }
        if (!startDate) {
            return res.json({ success: false, message: "Plase select start date" })
        }
        if (!endDate) {
            return res.json({ success: false, message: "Plase select End date" })
        }

        if (offerType == "category") {
            const offerData = new Offer({
                offerName: offerName,
                discount: discountRate,
                startDate: startDate,
                endDate: endDate,
                offerType: offerType,
                categoryId: selectedValues
            })
            await offerData.save()

        } else if (offerType == "product") {
            const offerData = new Offer({
                offerName: offerName,
                discount: discountRate,
                startDate: startDate,
                endDate: endDate,
                offerType: offerType,
                productId: selectedValues
            })
            await offerData.save()
        }

        res.status(200).json({ success: true })

    } catch (error) {
        console.log(error);

    }
}

const offerType = async (req, res) => {
    try {
        const { offerType } = req.body
        console.log('req.body', req.body);
        if (offerType == "category") {
            const categoryDetails = await category.find({})
            res.status(200).json({ categoryDetails })
        } else if (offerType == "product") {
            const productData = await productModel.find({})
            console.log("productData", productData);
            res.status(200).json({ productData })
        }


    } catch (error) {
        console.log('error in offerType', error);
    }

}

const loadeditOffer = async (req, res) => {
    try {
        const id = req.query.id
        console.log("my id", id);
        let offerData = await Offer.findOne({ _id: id })
        console.log("my offer", offerData);
        if (offerData.productId.length > 0) {
            const procuctData = await productModel.find({})

            res.render('editOffer', { offerData, Details: procuctData })
        }
        else if (offerData.categoryId.length > 0) {
            const categoryData = await category.find({})
            res.render('editOffer', { offerData, Details: categoryData })
        }

    } catch (error) {
        console.log(error);

    }
}

const offerproductIdSave = async (req, res) => {
    try {
        const { offerId, selectedProductIds } = req.body
        await Offer.updateOne({ _id: offerId }, { $set: { productId: selectedProductIds } })
        res.json({ success: true })

    } catch (error) {
        console.log('error in offerId', error);
    }
}

const offerCategoryIdSave = async (req, res) => {
    try {
        const { offerId, selectedCategoryIds } = req.body
        await Offer.updateOne({ _id: offerId }, { $set: { categoryId: selectedCategoryIds } })
        res.json({ success: true })

    } catch (error) {
        console.log('error in offercat', error);
    }
}

const editOffer = async (req, res) => {
    try {

        const { offerName, discount, startDate, endDate, offerId } = req.body
        console.log('req.body', req.body);
        const nameExist = await Offer.find({
            offerName: offerName.trim(),
            _id: { $ne: offerId }

        });
        console.log('nameExist', nameExist);
        if (nameExist.length !== 0) {
            return res.json({ success: false, message: 'name already exist' })
        }
        if (!offerName || offerName.trim() == "") {
            return res.json({ success: false, message: 'Plese select name' })
        }
        if (!discount || discount.trim() == '' || discount < 1 || discount > 80) {
            return res.json({ success: false, message: 'Please enter valid discount' })
        }
        if (!startDate || !endDate) {
            return res.json({ success: false, message: 'Date needed' })
        }
        await Offer.updateOne({ _id: offerId }, { $set: { offerName: offerName, discount: discount, startDate: startDate, endDate: endDate } })
        res.json({ success: true })

    } catch (error) {
        console.log('error in edit offer', error);
    }
}

const deleteOffer = async (req, res) => {
    try {
        const { id } = req.body
        await Offer.deleteOne({ _id: id })
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false })
        console.log('error in delete offer', error);
    }
}



module.exports = {
    loadOffer,
    addOffer,
    offerType,
    loadeditOffer,
    offerproductIdSave,
    offerCategoryIdSave,
    editOffer,
    deleteOffer

}