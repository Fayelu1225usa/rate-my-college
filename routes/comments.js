var express = require("express");
var router = express.Router({mergeParams: true});
var University = require("../models/university");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");


//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res) {
    University.findById(req.params.id, function(err, university) {
        if (err || !university) {
            req.flash("error", "University not found");
            res.redirect("back");
        } else {
            res.render("comments/new", {university: university});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res) {
    University.findById(req.params.id, function(err, university) {
        if (err) {
            console.log(err);
            res.redirect("/universities");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    university.comments.push(comment);
                    university.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/universities/" + university._id);
                }
            });
        }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    University.findById(req.params.id, function(err, foundUniversity){
        if (err || !foundUniversity) {
            req.flash("error", "No university found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {university_id: req.params.id, comment: foundComment});
        }
        });
    });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership,function(req, res) {
    
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
      if (err) {
          res.redirect("back");
      } else {
          res.redirect("/universities/" + req.params.id);
      }
  });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/universities/" + req.params.id);
        }
    });
});



module.exports = router;