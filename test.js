const userData = await User.findOne({ _id: req.session.userId })
        const cartCount=await cartModel.countDocuments({userId:req.session.userId})
        res.render("home", { user: userData,cartCount });