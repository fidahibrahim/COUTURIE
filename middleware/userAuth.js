const user=require('../models/userModel')

const isLogin = async(req,res,next)=>{
    try {
        if(req.session.userId){
            if(req.path === '/login'){
                res.redirect('/home');
                return;
            }
            next();
        }else{
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.userId){
            res.redirect('/home');
            return
        }else{
            next();
        }
    } catch (error) {
      console.log(error);  
    }
}

const isBlocked = async (req, res, next) => {
    const userId = req.session.userId
    if (userId) {
        try {
            const userData = await user.findOne({ _id: userId })
            if (userData && userData.is_blocked == true) {
                return res.redirect('/blocked-user')
            }


        } catch (error) {
            console.error(error)

        }

    }
    next()

}

module.exports={
    isLogin,
    isLogout,
    isBlocked
}