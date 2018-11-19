var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res){
    res.render("landing");
});

//auth routes

router.get("/register", function(req, res){
    res.render("register", {page: "register"});
});

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        } 
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//show login form

router.get("/login", function(req, res){
    res.render("login", {page: "login"});
});

//post route for login
router.post("/login", function(req, res, next){
    passport.authenticate("local", 
        {
            successRedirect:"/campgrounds",
            failureRedirect: "/login",
            failureFlash: true,
            successFlash: "Welcome back " + req.body.username + "!"
        }) (req, res);
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You are logged out");
    res.redirect("/campgrounds");
});

module.exports = router;

