var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    school: String,
    email: String,
    introduction: String,
    isAdmin: {type: Boolean, default: false}
});



UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);