var express = require("express");
var mongoose   = require("mongoose");
var router  = express.Router();
var University = require("../models/university");
var middleware = require("../middleware/index.js"); 
var geo = require('mapbox-geocoding');
geo.setAccessToken(process.env.MAPBOX_PUBLIC_API_KEY);

var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dnlt2qtah', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
 
 


//INDEX - show all universities
router.get("/", function(req, res){
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi'); //case insentive and partial match
         
        University.find({name: regex}, function(err, allUniversities){
           if(err){
               console.log(err);
           } else {
              res.render("universities/index",{universities: allUniversities, page: 'universities'});
           }
        });
    } else {
        // Get all universities from DB
        University.find({}, function(err, allUniversities){
           if(err){
               console.log(err);
           } else {
              res.render("universities/index",{universities: allUniversities, page: 'universities'});
           }
        });
    }
});

//CREATE - add new university to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
  // get data from form and add to universities array
   
  geo.geocode('mapbox.places', req.body.location, function (err, data) {
     
    if (err || !data.features.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    
    req.body.university.lat = data.features[0].center[1];
    req.body.university.lng = data.features[0].center[0];
    req.body.university.location = data.features[0].place_name;
    
    cloudinary.uploader.upload(req.file.path, function(result) {
      // add cloudinary url for the image to the university object under image property
      req.body.university.image = result.secure_url;
      // add author to university
      req.body.university.author = {
        id: req.user._id,
        username: req.user.username
      };
    
      University.create(req.body.university, function(err, university) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        } 
        res.redirect('/universities/' + university.id);
      });
    });
  });
});



//NEW - show form to create new university
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("universities/new"); 
});

// SHOW - shows more info about one university
router.get("/:id", function(req, res){
    //find the university with provided ID
     
    University.findById(req.params.id).populate({path: 'comments', options: { sort: { 'createdAt': -1 }}}).exec(function(err, foundUniversity){
        if(err ||!foundUniversity){
            
            req.flash("error", "University is not found");
            res.redirect("back");
        } else {
              
            //render show template with that university
            res.render("universities/show", {university: foundUniversity, mapbox_apiKey:process.env.MAPBOX_PUBLIC_API_KEY});
        }
    });
    
});

//EDIT UNIVERSITY ROUTE
router.get("/:id/edit", middleware.checkUniversityOwnership, function(req, res) {
    University.findById(req.params.id, function(err, foundUniversity){
        res.render("universities/edit", {university: foundUniversity});
    });
});


// UPDATE UNIVERSITY ROUTE
router.put("/:id", middleware.checkUniversityOwnership, function(req, res){
  geo.geocode('mapbox.places', req.body.location, function (err, data) {
    if (err || !data.features.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.university.lat = data.features[0].center[1];
    req.body.university.lng = data.features[0].center[0];
    req.body.university.location = data.features[0].place_name;

    University.findByIdAndUpdate(req.params.id, req.body.university, function(err, university){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/universities/" + university._id);
        }
    });
  });
});


// DESTROY UNIVERSITY
router.delete("/:id", middleware.checkUniversityOwnership, function(req, res) {
    University.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/universities");
        } else {
            res.redirect("/universities");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;