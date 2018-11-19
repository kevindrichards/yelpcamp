var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
//don't need to name actual index file - auto lookup "index.js"
var middleware = require("../middleware");


router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var cost = req.body.cost;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, image: image, description: desc, cost: cost, author: author};
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
            req.flash("error", "Oops, something went wrong... :(");
        }else{
            req.flash("success", "Created new campground!");
            res.redirect("/campgrounds"); 
        }
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            console.log(err);
            req.flash("error", "Sorry, that campground doesn't exist!");
            return res.redirect("/campgrounds");
        } else{
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//edit campgrounds route
router.get("/:id/edit", middleware.isLoggedIn, middleware.checkCampgroundOwnership, function(req, res){
    res.render("campgrounds/edit", {campground: req.campground}); 

});

//update route
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            req.flash("error", "Oops, something went wrong... :(");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "You updated a campground!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//destroy
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Oops, something went wrong... :(");
            res.redirect("/campgrounds");
        } else{
            req.flash("success", "You removed a campground!");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;