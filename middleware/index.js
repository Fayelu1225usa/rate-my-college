// This file contains all the middlewares used

var University = require("../models/university");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkUniversityOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        University.findById(req.params.id, function(err, foundUniversity) {
        if (err || !foundUniversity) {
            req.flash("error", "University not found");
            res.redirect("back");
        } else {
            //Check if the user own the university
            if (foundUniversity.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        }
    });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err || !foundComment) {
            req.flash("error", "Comment not found");
            res.redirect("back");
        } else {
            //Check if the user own the comment
            if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
            
        }
    });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

module.exports = middlewareObj;


