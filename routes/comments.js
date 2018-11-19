var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground})
        }
    });
    
});

router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            req.flash("error", "Something went wrong... :(");
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Oops, something went wrong... :(");
                    console.log(err);
                } else {
                    //add username and id
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "You created a new comment!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//comments edit route
router.get("/:comment_id/edit", middleware.isLoggedIn, middleware.checkCommentOwnership, function(req, res){
    res.render("comments/edit", {campground_id: req.params.id, comment: req.comment});
   
});

//comments update route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err || !updatedComment){
            req.flash("error", "Oops, something went wrong... :(");
            res.redirect("back");
        } else {
            req.flash("success", "Updated a comment!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//comments delete route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "Oops, something went wrong... :(");
            res.redirect("back");
        } else {
            req.flash("success", "Deleted a comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;