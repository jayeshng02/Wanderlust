const User = require("../models/user.js");

module.exports.signupUser=async(req,res)=>{
    try{
        let{username,email,password} = req.body;
        const newUser = new User({email,username});
        let registeredUser = await User.register(newUser,password);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust!!");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}

module.exports.signupForm=(req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.loginForm=(req,res)=>{
    res.render("users/login.ejs");
}

module.exports.loginUser=async (req,res)=>{
                req.flash("success","Welcome Back to Wanderlust");
                const redirectUrl = res.locals.redirectUrl || "/listings";
                res.redirect(redirectUrl);
}

module.exports.logoutUser=(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged you Out");
        res.redirect("/listings");
    })
}