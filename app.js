"use strict";

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const port = 3000;

const app = express();

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email : String,
    password : String
})




const User = mongoose.model("User", userSchema);



app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register",async function(req, res){
    const bcryptedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = new User({
        email:req.body.username,
        password : bcryptedPassword
    });

    try{
        await newUser.save();
        res.render("secrets");
    } catch (err){
        console.log(err);
    }
    
});

app.post("/login", async function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    try{
        const foundUser = await User.findOne({email:username});
        if (foundUser){
            const compareResult = await bcrypt.compare(password, foundUser.password);

            if (compareResult){
                res.render("secrets");
            }
        }
    } catch (err){
        console.log(err);
    }

});


app.listen(port, function(){
    console.log(`Server is running on port ${port}`);
});