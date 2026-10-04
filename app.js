if(process.env.NODE_ENV!="production"){
    const dotenv = require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter =require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");
const session = require("express-session");
const {MongoStore} = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public/css")));
app.use(express.static(path.join(__dirname,"/public/js")));



const atlasUrl = process.env.ATLAS_URL;
async function main(){
    await mongoose.connect(atlasUrl);
}

main()
.then(()=>{
    console.log("The DB Started");
})
.catch((err)=>{
    console.log(err);
});

const store = MongoStore.create({
    mongoUrl:atlasUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*60*60
});

store.on("err",()=>{
    console.log("error in mongo session store",err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + (7*24*60*60*1000),
        maxAge: 7*24*60*60*1000,
        httpOnly:true
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// response - locals
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

// BASE
// app.get("/",(req,res)=>{
//     res.send("Working");
// });

// app.get("/demo",async (req,res)=>{
//     let fakeUser =new User({
//         email:"abc@gmail.com",
//         username:"Raakesss"
//     });

//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// Page Not Found
app.all("/*splat",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

// CUSTOM ERROR HANDLER (MIDDLEWARE)
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something Went Wrong"} = err;
    res.status(statusCode).render("listings/Error.ejs",{message,statusCode});
})

let port = 8080;
app.listen(port,()=>{
    console.log("Server is running Successfully");
})