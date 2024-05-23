const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const userModel = require('../models/userModel');


const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user=await userModel.findOne({_id:userId})
        const wishlist = await Wishlist.find({ userId: userId }).populate('products.productId');
        res.render('wishlist', { wishlist,user });

    } catch (error) {
        res.redirect('/500')
    }
}

const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;
        console.log(productId);

        if (!userId) {
            return res.json({ loginRequired: true });
        }
        let wishlist = await Wishlist.findOne({ userId });

        if (wishlist) {
            const existingProduct = await Wishlist.findOne({ userId, 'products.productId': productId });
            if (existingProduct) {
                return res.json({ used: true });
            } else {
                await Wishlist.findOneAndUpdate(
                    { userId: userId },
                    { $push: { products: { productId } } }
                );
            }
        } else {
            wishlist = new Wishlist({
                userId,
                products: [{ productId }]
            });
            await wishlist.save();
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.userId
        const productId = req.body.productId
        const wishlist = await Wishlist.findOne({ userId: userId })
        if (wishlist) {
            await Wishlist.findOneAndUpdate({ userId: userId }, {
                $pull: {
                    products: { productId: productId }
                }
            })
        }
        res.json({ ok: true })
    } catch (error) {
        res.redirect('/500')

    }
}

const addToCart = async (req, res) => {
    try {
        const { productId } = req.body
        console.log("body",req.body);
        const userId = req.session.userId
        const product = await Product.findOne({ _id: productId }).populate('category')
        console.log("prdct",product);
        const cart = await Cart.findOne({ userId: userId })

        if (cart) {
            const existproduct = await cart.products.find((product) => product.productId == productId)
            if (existproduct) {
                return res.json({ existProduct: true })
            } else {
                await Cart.findOneAndUpdate({ userId: userId }, {
                    $push: {
                        products: {
                            productId: productId,
                            quantity: 1,
                            productPrice: product.price,
                            totalPrice: product.price
                        }
                    }
                })
                res.json({ ok: true })
            }

        } else {
            const newCart = new Cart({
                userId: userId,
                products: [
                    {
                        productId: productId,
                            quantity: 1,
                            productPrice: product.price,
                            totalPrice: product.price
                    }
                ]
            })
            await newCart.save();
            res.json({ ok: true })
        }
    } catch (error) {
        res.redirect('/500')
    }
}

module.exports = {
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    addToCart
}