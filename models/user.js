
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// var myPosts = mongoose.Schema({
//     postType: String,
//     imageUrl: [String],
//     postDesc: String,
//     postLocation : String,
//     timestamp: String
// });

var myNotification = mongoose.Schema({
    name: String,
    email:String,
    contact: Number,
    message: String,
    isRead:Boolean
    });

var userSchema = mongoose.Schema({

    data             : {

        firstName    : String,
        lastName     : String,

        // main credentails #password is encrypted has of actual password
        email        : String,
        correspondanceEmail: String,
        password     : String,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        notifEnabled : String,
        sleepTime:    String,
        wakeupTime:   String,
        acceptVisitor: String,
        listenMusic:  Boolean,
        smoke:        Boolean,
        roomClean:    String,
        share:        Boolean,
        about        : String,
        dob          : String,
        gender       : String,
        contact     : Number,
        profileURL  : String,
        hasUpdatedProfile : Boolean,
        notifications:[myNotification]
        // Posts       : [myPosts]

        // // these will be google login session variables
        // refreshToken    : String,
        // token           : String,
    }

});

// generate hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.data.password);
};

// create the model for patients and doctors and expose it to our app
module.exports = mongoose.model('User', userSchema);