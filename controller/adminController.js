const User = require("../models/userModel");
const bcrypt = require('bcrypt')

const adminLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            req.flash("message", "Admin not found")
            res.redirect("/admin/")
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            req.flash('message', "Incorrect Password");
            res.redirect('/admin/');
            return;
        }

        if (user.is_admin === 1) {
            req.session.admin = user._id
            res.redirect("/admin/adminDashboard");
        } else {
            req.flash("message", "You are not authorized as an admin");
            res.redirect("/admin/");
        }

    } catch (error) {
        console.log(error);
    }
}

const loadDashboard = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.admin })
        res.render('adminDashboard', { user: user });

    } catch (error) {
        console.log(error);
    }
}


const loadUsers = async (req, res) => {
    try {
        let page = 1;
        if (req.query.id) {
            page = req.query.id
        }
        let limit = 5;
        let Next = page + 1;
        let Previous = page > 1 ? page - 1 : 1


        const count = await User.find({
            is_admin: 0
        }).count()

        let totalPages = Math.ceil(count / limit)
        if (Next > totalPages) {
            Next = totalPages
        }

        const users = await User.find({ is_admin: 0, })
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .exec()




        res.render('userManagment',
            {
                users: users,
                page: page,
                Previous: Previous,
                Next: Next,
                totalPages: totalPages,
                currentPage: page, 
                pageSize: limit
            })
    } catch (error) {
        console.log("error");

    }
}

const userStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { is_blocked: !userData.is_blocked } },
            { new: true }
        );

        res.send({ status: "success", user: updatedUser });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const logout = async (req, res) => {
    try {
        req.session.admin = null
        res.redirect('/admin/')
    } catch (error) {
        console.log(erro);

    }
}

module.exports = {
    adminLogin,
    verifyLogin,
    loadDashboard,
    loadUsers,
    userStatus,
    logout

}