const moment = require("moment");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const User = require("../models/userModel");
const bcrypt = require('bcrypt')

const adminLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        res.redirect('/500')
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
        res.redirect('/500');
    }
}

const loadDashboard = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.admin })

        //======================= total users=======================

        const totalUsers = await User.countDocuments({})
        const totalProducts = await productModel.countDocuments({})

        const totalOrderCount = await orderModel.aggregate([
            {
                $unwind: '$products'
            },
            {
                $match: {
                    'products.status': { $ne: 'pending' }
                }

            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const totalOrders = totalOrderCount.length != 0 ? totalOrderCount[0].totalOrders : 0

        // if(totalOrderCount.length != 0){
        //     totalOrders = totalOrderCount[0].totalOrders
        // }else{
        //     totalOrders = 0
        // }

        const totalSales = await orderModel.aggregate([
            {
                $unwind: '$products'
            },
            {
                $match: {
                    'products.status': 'delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    Revenue: {
                        $sum: {
                            $subtract: [
                                {
                                    $multiply: ['$products.quantity', '$products.totalPrice']
                                },
                                '$products.discountPerItem'
                            ]
                        }
                    }
                }
            }
        ]);


        const totalRevenue = totalSales.length != 0 ? totalSales[0].Revenue : 0

        console.log("revenue", totalRevenue);


        // =================graph=========================

        // ===================== Monthly earnings =============================


        const currentYear = new Date().getFullYear()
        const yearsToInclude = 6
        const currentMonth = new Date().getMonth() + 1


        let previousMonth;
        let previousYear;

        if (currentMonth === 1) {
            // If current month is January, set previous month to December of previous year
            previousMonth = 12;
            previousYear = currentYear - 1;
        } else {
            // Otherwise, set previous month to the previous month
            previousMonth = currentMonth - 1;
            previousYear = currentYear;
        }



        const defaultMonthlyValues = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            total: 0,
            count: 0
        }))


        const defaultYearlyValues = Array.from({ length: yearsToInclude }, (_, i) => ({
            year: currentYear - yearsToInclude + i + 1,
            total: 0,
            count: 0
        }))


        const monthlySalesData = await orderModel.aggregate([
            {
                $unwind: '$products'
            },
            {
                $match: {
                    'products.status': 'delivered',
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1), // Beginning of the current year
                        $lte: new Date(currentYear, currentMonth, 0) // Last day of the current month
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    total: {
                        $sum: {
                            $subtract: [
                                {
                                    $multiply: ['$products.quantity', '$products.totalPrice']
                                },
                                '$products.discountPerItem'
                            ]
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id',
                    total: '$total',
                    count: '$count'
                }
            }
        ])

        const updatedMonthlyValues = defaultMonthlyValues.map((defaultMonth) => {
            const foundMonth = monthlySalesData.find((monthData) => monthData.month === defaultMonth.month)
            return foundMonth || defaultMonth
        })


        console.log("monthly sales data", updatedMonthlyValues);


        //============================== yearly sales data graph ============================


        const yearlySalesData = await orderModel.aggregate([
            {
                $unwind: '$products'
            },
            {
                $match: {
                    'products.status': 'delivered',
                    createdAt: { $gte: new Date(currentYear - yearsToInclude, 0, 1) }
                }
            },
            {
                $group: {
                    _id: { $year: '$createdAt' },
                    total: {
                        $sum: {
                            $subtract: [
                                {
                                    $multiply: ['$products.quantity', '$products.totalPrice']
                                },
                                '$products.discountPerItem'
                            ]
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: '$_id',
                    total: '$total',
                    count: '$count'
                }
            }
        ]);

        const updatedYearlyValues = defaultYearlyValues.map((defaultYear) => {
            const foundYear = yearlySalesData.find((yearData) => yearData.year === defaultYear.year)
            return foundYear || defaultYear
        })

        console.log("yearly sales data", updatedYearlyValues);

        //================================ Monthly Orders ================================================

        const monthlyOrders = await orderModel.aggregate([
            {
                $unwind: '$products'
            },
            {
                $match: {
                    'products.status': 'delivered',
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1), 
                        $lte: new Date(currentYear, currentMonth, 0) 
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    totalOrders: { $sum: 1 }
                }
            }
        ])

        const updatedMonthlyOrders = defaultMonthlyValues.map((defaultMonth) => {
            const foundMonth = monthlyOrders.find(
                (monthData) => monthData._id === defaultMonth.month
            )
            return { month: defaultMonth.month, totalOrders: foundMonth ? foundMonth.totalOrders : 0 }
        })

        console.log("monthly orders", updatedMonthlyOrders);


        //========================================== Yearly Orders =======================================

        const yearlyOrders = await orderModel.aggregate([
            {
                $unwind:
                    '$products'
            },
            {
                $match: {
                    'products.status': 'delivered',
                    createdAt: { $gte: new Date(currentYear - yearsToInclude, 0, 1) }
                }
            },
            {
                $group: {
                    _id: { $year: '$createdAt' },
                    totalOrders: { '$sum': 1 }
                }
            }
        ])

        const updatedYearlyOrders = defaultYearlyValues.map((defaultYear) => {
            const foundYear = yearlyOrders.find(
                (yearData) => yearData._id === defaultYear.year
            )
            return { year: defaultYear.year, totalOrder: foundYear ? foundYear.totalOrders : 0 }
        })

        console.log('yearly orders', updatedYearlyOrders);



        //================================= Monthly users ==========================================

        const monthlyUsers = await userModel.aggregate([
            {
                $match: {

                    createdAt: {
                        $gte: new Date(currentYear, 0, 1), 
                        $lte: new Date(currentYear, currentMonth, 0) 
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    totalUsers: { $sum: 1 }
                }
            }
        ])

        const updatedMonthlyUsers = defaultMonthlyValues.map((defaultMonth) => {
            const foundMonth = monthlyUsers.find(
                (monthData) => monthData._id === defaultMonth.month
            )
            return { month: defaultMonth.month, totalUsers: foundMonth ? foundMonth.totalUsers : 0 }
        });

        console.log("monthly total users ", updatedMonthlyUsers);

        //===================================== Yearly Users ==========================================

        const yearlyUsers = await userModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(currentYear - yearsToInclude, 0, 1) }
                }
            },
            {
                $group: {
                    _id: { $year: '$createdAt' },
                    totalUsers: { $sum: 1 }
                }
            }
        ])

        const updatedYearlyUsers = defaultYearlyValues.map((defaultYear) => {
            const foundYear = yearlyUsers.find(
                (yearData) => yearData._id === defaultYear.year
            )
            return { year: defaultYear.year, totalUsers: foundYear ? foundYear.totalUsers : 0 }
        })

        console.log("yearly total users", updatedYearlyUsers);

        // new users 

        const latestUsers = await userModel.find({ verified: true }).sort({ createdAt: -1 }).limit(5)

        //latest orders

        const latestOrders = await orderModel.aggregate([
            {
                $unwind: '$products'
            },
            {
                $match: {
                    'products.status': { $ne: 'pending' }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $limit: 10
            }
        ])


        const paymentCount = await orderModel.aggregate([
            { $unwind: '$products' },
            { $match: { 'products.status': { $ne: 'pending' } } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    cod: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'COD'] }, 1, 0]
                        }
                    },
                    razorpay: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'RAZORPAY'] }, 1, 0]
                        }
                    },
                    wallet: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentMethod', 'WALLET'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        //best selling products

        const bestProducts = await orderModel.aggregate([
            {
                $unwind:'$products'
            },
            {
                $match:{
                    'products.status':'delivered'
                }
            },
            {
                $group:{
                    _id:'$products.productId',
                    count:{
                        $sum:'$products.quantity'
                    }
                }
            },
            {
                $sort:{
                    count:-1
                }
            },
            {
                $limit:3
            },
            {
                $lookup:{
                    from:'products',
                    localField:'_id',
                    foreignField:'_id',
                    as:'productDetails'
                }
            },
            {
                $project:{
                    _id:'$_id',
                    productName:{ $arrayElemAt:['$productDetails.name',0] },
                    productImg:{ $arrayElemAt:['$productDetails.images',0] },
                    quantitySold: '$count'
                }
            }
        ])


        // best selling category

        const bestCategories = await orderModel.aggregate([
            {
                $unwind:'$products'
            },
            {
                $lookup:{
                    from:'products',
                    localField:'products.productId',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $unwind:'$product'
            },
            {
                $group:{
                    _id:'$product.category',
                    orderCount:{
                        $sum:1
                    }
                }
            },
            {
                $sort:{
                    orderCount:-1
                }
            },
            {
                $lookup:{
                    from:'categories',
                    localField:'_id',
                    foreignField:'_id',
                    as:'category'
                }
            },
            {
                $unwind: '$category' 
            },
            {
                $project: { 
                    categoryName: '$category.name',
                    orderCount: 1
                }
            },
            {
                $sort:{
                    orderCount:-1
                }
            }
        ])












        res.render('adminDashboard', {
            user: user,
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,


            updatedMonthlyValues,
            updatedYearlyValues,
            updatedMonthlyOrders,
            updatedYearlyOrders,
            updatedMonthlyUsers,
            updatedYearlyUsers,

            paymentCounts:paymentCount[0],


            latestUsers,
            latestOrders,


            bestProducts,
            bestCategories,
            moment

        });

    } catch (error) {
        console.log(error);
        res.redirect('/500');
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
        res.redirect('/500')

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
        res.redirect('/500');
        res.status(500).json({ error: "Internal Server Error" });
    }
};



const logout = async (req, res) => {
    try {
        req.session.admin = null
        res.redirect('/admin/')
    } catch (error) {
        res.redirect('/500');

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