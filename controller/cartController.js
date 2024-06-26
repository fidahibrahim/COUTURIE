const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Offer = require('../models/offerModel');


const addToCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId, quantity } = req.body;

        if (!userId) {
            return res.json({ loginRequired: true });
        }

        const productData = await Product.findOne({ _id: productId }).populate('category');
        const cartData = await Cart.findOne({ userId: userId });
        const offerData = await Offer.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        let productDiscountedPrice = productData.price;
        let categoryDiscountPrice = productData.price;
        let highestProductDiscount = 0;
        let highestCategoryDiscount = 0;
        let appliedOffer = null;
        let discountedPrice;

      
        offerData.forEach(offer => {
            if (offer.offerType === 'product' && offer.productId.includes(productData._id.toString())) {
                const discountPrice = productData.price - (productData.price * offer.discount / 100);
                if (offer.discount > highestProductDiscount) {
                    highestProductDiscount = offer.discount;
                    productDiscountedPrice = discountPrice;
                }
            }
        });

        offerData.forEach(offer => {
            if (offer.offerType === 'category' && offer.categoryId.includes(productData.category._id.toString())) {
                const discountPrice = productData.price - (productData.price * offer.discount / 100);
                if (offer.discount > highestCategoryDiscount) {
                    highestCategoryDiscount = offer.discount;
                    categoryDiscountPrice = discountPrice;
                }
            }
        });

     
        if (highestProductDiscount >= highestCategoryDiscount) {
            discountedPrice = Math.round(productDiscountedPrice);
            appliedOffer = offerData.find(offer => offer.offerType === 'product' && offer.productId.includes(productData._id.toString()) && offer.discount === highestProductDiscount);
        } else {
            discountedPrice = Math.round(categoryDiscountPrice);
            appliedOffer = offerData.find(offer => offer.offerType === 'category' && offer.categoryId.includes(productData.category._id.toString()) && offer.discount === highestCategoryDiscount);
        }

        const cartProduct = {
            productId: productId,
            quantity: quantity,
            productPrice: discountedPrice,
            totalPrice: quantity * discountedPrice,
            offerApplied: appliedOffer
        };

        if (cartData) {
            const existingProductIndex = cartData.products.findIndex(product => product.productId.toString() === productId);
            if (existingProductIndex !== -1) {
                cartData.products[existingProductIndex].quantity += parseInt(quantity, 10);
                cartData.products[existingProductIndex].totalPrice += parseInt(quantity, 10) * cartProduct.productPrice;
            } else {
                cartData.products.push(cartProduct);
            }

            await cartData.save();
        } else {
            const newCart = new Cart({
                userId: userId,
                products: [cartProduct]
            });
            await newCart.save();
        }

        res.json({ success: true });

    } catch (error) {
        console.log(error);
        res.redirect('/500');
    }
};

const loadCart = async (req, res) => {
    try {
        const userData = req.session.userId;
        const cartCount = await Cart.countDocuments({ userId: req.session.userId });
        const cartDetails = await Cart.findOne({ userId: userData }).populate({
            path: "products.productId",
            model: "Product"
        });
        const user = await User.findOne({ _id: userData });

        let offerData = await Offer.find({ startDate: { $lte: new Date() }, endDate: { $gte: new Date() } });

        let subTotal = 0;
        let cartId = null;

        if (cartDetails) {
            cartDetails.products.forEach((product) => {
                let itemPrice = product.productId.price;
                let discountedPrice = itemPrice;
                let appliedOffer = null;

           
                const productOffers = offerData.filter(offer =>
                    offer.offerType === 'product' &&
                    offer.productId.includes(product.productId._id.toString())
                );

                
                const categoryOffers = offerData.filter(offer =>
                    offer.offerType === 'category' &&
                    offer.categoryId.includes(product.productId.category._id.toString())
                );

             
                const highestProductDiscount = productOffers.reduce((maxDiscount, offer) => Math.max(maxDiscount, offer.discount), 0);

               
                const highestCategoryDiscount = categoryOffers.reduce((maxDiscount, offer) => Math.max(maxDiscount, offer.discount), 0);

             
                if (highestProductDiscount > highestCategoryDiscount) {
                    const productOffer = productOffers.find(offer => offer.discount === highestProductDiscount);
                    appliedOffer = productOffer;
                    discountedPrice = Math.round(itemPrice - (itemPrice * productOffer.discount / 100));
                } else if (highestCategoryDiscount > 0) {
                    const categoryOffer = categoryOffers.find(offer => offer.discount === highestCategoryDiscount);
                    appliedOffer = categoryOffer;
                    discountedPrice = Math.round(itemPrice - (itemPrice * categoryOffer.discount / 100));
                }

              
                subTotal += discountedPrice * product.quantity;
                product.discountedPrice = discountedPrice;
                product.appliedOffer = appliedOffer;
                product.offerText = appliedOffer ? `${appliedOffer.discount}% off` : '';
            });
            cartId = cartDetails._id;
        } else {
            return res.render('cart', { cartDetails, user, subTotal: 0, cartId, cartCount });
        }

        return res.render('cart', { cartDetails, user, subTotal, cartId, userData, cartCount });
    } catch (error) {
        console.log(error);
        res.redirect('/500');
    }
};


const deleteCart = async (req, res) => {
    try {
        const productId = req.body.product;
        const userId = req.session.userId;

        const cartUser = await Cart.findOne({ userId: userId });
        let totalPrice = 0;

        if (cartUser.products.length == 1) {
            await Cart.deleteOne({ userId: userId });
        } else {
            await Cart.findOneAndUpdate(
                { userId: userId },
                { $pull: { products: { _id: productId } } }
            );
        }
        const updatedCartUser = await Cart.findOne({ userId: userId });
        if (updatedCartUser) {
            totalPrice = updatedCartUser.products.reduce((acc, cur) => acc + cur.price, 0);
        }

        res.json({ success: true, totalPrice });
    } catch (error) {
        res.redirect('/500')
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};



const updateQuantity = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { cartId, productId, quantity } = req.body;

        const product = await Product.findById(productId);
        const existingCart = await Cart.findById(cartId).populate({
            path: "products.productId",
            model: "Product"
        });

        if (!existingCart) {
            return res.json({ success: false, message: 'Cart Not Found' });
        }

        if (!existingCart.products || existingCart.products.length === 0) {
            return res.json({ success: false, message: 'No products in the cart' });
        }

        const productToUpdate = existingCart.products.find(p => p.productId.equals(productId));

        if (!productToUpdate) {
            return res.json({ success: false, message: 'Product Not Found In The Cart' });
        }

        const productPrice = productToUpdate.productPrice;

        // Update quantity and total price
        productToUpdate.quantity = quantity;
        productToUpdate.totalPrice = quantity * productPrice;

        // Update subTotal and grandTotal of the cart
        existingCart.subTotal = existingCart.products.reduce((total, product) => {
            return total + product.totalPrice;
        }, 0);
        existingCart.grandTotal = existingCart.subTotal;
        // Save the updated cart
        const updatedCart = await existingCart.save();

        res.json({
            success: true,
            message: "Quantity Updated Successfully",
            updatedTotalPrice: productToUpdate.totalPrice,
            totalPriceTotal: existingCart.subTotal
        });
    } catch (error) {
        res.redirect('/500');
    }
}




module.exports = {
    loadCart,
    addToCart,
    deleteCart,
    updateQuantity
}