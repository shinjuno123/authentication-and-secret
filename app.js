"use strict";

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const port = 3000;

const app = express();




app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret:"Our little secret.",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){
    if (req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    } 
});

app.post("/register",async function(req, res){
    try{
        await User.register({username: req.body.username}, req.body.password);
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        });
    }catch (err){
        console.log(err);
        res.redirect("/register");
    }
});

app.get("/logout", function(req, res){
    req.logOut(function(err){
        if (err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
})

app.post("/login", async function(req, res){
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    try{
        req.login(user, function(err){
            if (err){
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                });
            }
        });
    } catch (err){
        console.log(err);
    }

});


app.listen(port, function(){
    console.log(`Server is running on port ${port}`);
});