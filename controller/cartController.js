const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');


const addToCart = async (req, res) => {
    try {
        const userId = req.session.userId
        const { productId, quantity } = req.body


        if (!userId) {
            return res.json({ loginRequired: true })
        } else {
            const productData = await Product.findOne({ _id: productId });
            const cartData = await Cart.findOne({ userId: userId })
            if (cartData) {
                const existProduct = cartData.products.find(
                    (x) => x.productId.toString() === productId
                )
                if (existProduct) {
                    await Cart.findOneAndUpdate(
                        { userId: userId, "products.productId": productId },
                        {
                            $inc: {
                                "products.$.quantity": quantity,
                                "products.$.totalPrice": quantity * productData.price,
                            },
                        }
                    )
                } else {
                    await Cart.findOneAndUpdate(
                        { userId: userId },
                        {
                            $push: {
                                products: {
                                    productId: productId,
                                    quantity: quantity,
                                    productPrice: productData.price,
                                    totalPrice: quantity * productData.price

                                },
                            },
                        }
                    );
                }
            } else {
                const newCart = new Cart({
                    userId: userId,
                    products: [
                        {
                            productId: productId,
                            quantity: quantity,
                            productPrice: productData.price,
                            totalPrice: quantity * productData.price
                        },
                    ],
                });
                await newCart.save()
            }
            res.json({ success: true })
        }
    } catch (error) {
        res.redirect('/500')
    }
}

const loadCart = async (req, res) => {
    try {
        const userData = req.session.userId;
        const cartDetails = await Cart.findOne({ userId: userData }).populate({
            path: "products.productId",
            model: "Product"
        });
        const user = await User.findOne({ _id: userData });

        let subTotal = 0;
        let cartId = null;

        if (cartDetails) {
            cartDetails.products.forEach((product) => {
                let itemPrice = product.productId.price;
                subTotal += itemPrice * product.quantity;
            });
            cartId = cartDetails._id;
        } else {

            return res.render('cart', { cartDetails, user, subTotal: 0, cartId });
        }

        res.render('cart', { cartDetails, user, subTotal, cartId });
    } catch (error) {
        res.redirect('/500')

        res.status(500).send('Internal Server Error');
    }
};

const deleteCart = async (req, res) => {
    try {
        const productId = req.body.product;
        const userId = req.session.userId;

        const cartUser = await Cart.findOne({ userId: userId });
        let totalPrice = 0; // Initialize total price

        if (cartUser.products.length == 1) {
            await Cart.deleteOne({ userId: userId });
        } else {
            await Cart.findOneAndUpdate(
                { userId: userId },
                { $pull: { products: { _id: productId } } }
            );
        }

        // Calculate the updated total price
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
        console.log("asdfghj", req.body);
        const product = await Product.findById(productId);
        const productPrice = product.price;
        const existingCart = await Cart.findById(cartId).populate({
            path: "products.productId",
            model: "Product"
        })
        console.log("iuytrew", product);
        console.log("kjhgfdsa", existingCart);

        if (!existingCart) {
            req.flash('message', 'Cart Not Found');
        }

        if (!existingCart.products || existingCart.products.length === 0) {
            req.flash('message', 'No products in the cart');
            return res.json({ success: false, message: 'No products in the cart' });
        }

        const productToUpdate = existingCart.products.find(p => p.productId.equals(productId));

        if (!productToUpdate) {
            req.flash('message', 'Product Not Found In The Cart');
        }

        productToUpdate.quantity = quantity
        productToUpdate.totalPrice = quantity * productPrice

        existingCart.subTotal = existingCart.products.reduce((total, product) => {
            return total + product.totalPrice
        }, 0)
        existingCart.grandTotal = existingCart.subTotal
        const updatedCart = await existingCart.save();

        res.json({
            success: true,
            message: "Quantity Updated Successfully",
            updatedTotalPrice: productToUpdate.totalPrice,
            totalPriceTotal: existingCart.subTotal
        });
    } catch (error) {
        res.redirect('/500')
    }
}



module.exports = {
    loadCart,
    addToCart,
    deleteCart,
    updateQuantity
}