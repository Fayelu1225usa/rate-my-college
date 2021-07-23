require('dotenv').config();

var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    flash      = require("connect-flash"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"), 
    methodOverride = require("method-override"),
    University = require("./models/university"),
    Comment    = require("./models/comment"),
    User       = require("./models/user");

//requiring routes    
var commentRoutes    = require("./routes/comments"),
    universityRoutes = require("./routes/universities"),
    indexRoutes      = require("./routes/index");

// mongoose.connect(process.env.DATABASEURL); 
mongoose.connect(process.env.DATABASEURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again this is the best full stack app",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
 
app.use("/", indexRoutes);
app.use("/universities" ,universityRoutes);
app.use("/universities/:id/comments",commentRoutes);

//3000, 127.0.0.1 or process.env.PORT, process.env.IP
app.listen(process.env.PORT, process.env.IP, function() {
   console.log("The server has started!"); 
});