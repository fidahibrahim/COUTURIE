const loadCart = async (req, res) => {
    try {
      const userData = req.session.user_id;
      const cartDetails = await cart.findOne({ user_id: userData })
        .populate({
          path: "items.product_id",
          model: "product"
        });
  
      const user = await User.findOne({ _id: userData });
  
      let total = 0;
      let orginalAmt = 0;
  
      if (cartDetails) {
        cartDetails.items.forEach((product) => {
          let itemPrice = product.product_id.price;
          orginalAmt += itemPrice * product.quantity;
          total += itemPrice * product.quantity;
        });
      }
  
      res.render("cart", { cartDetails, user, subTotal: orginalAmt, total, discountAmnt: 0 });
    } catch (error) {
      res.redirect('/500');
    }
  };