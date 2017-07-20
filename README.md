# RommieFinder
This is a Web Application built entirely using Node.js, Sass, HTML which helps people identify their potential roommates or to help them identify a subletter. It gives two options . 
You can either create a new post lettign popl know that you are looking for a roommate for your apartment or to create a post for subletting the apartment. Google places API is used to diplay the geographical locations.
The information about the users are stored in MongoDB. This inclues their preferences and username and hashed passowrd info. Nodemailer is used to help poople change their passord if they forget them.
The user profile pictures and pictures uploaded for their posts are stored in aws. 

This app contains two database tables stored in mongodb

User:
It contains information about the user their preferences.
```
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
    }

});
```
The myNotification submodule is used to indicate users about the notifications they receive when a user who searches for an house cooments on the posts. This will inform the user about the person who has shown interest,their contact number and their message

Post:
It contains all the information about the posts created by several users. Users are lined to the post with the help of object id

```
var PostsSchema = mongoose.Schema({
    postType: String,
    imageUrl: [String],
    postDesc: String,
    postLocation : String,
    timestamp: String,
    price:Number,
    roomType: Number,
    hasPets: Number,
    hasChildren: Number,
    status:String,
    hasInterests:[mongoose.Schema.ObjectId],
    user: mongoose.Schema.ObjectId
});
```
So the user searches for an apartment at aparticular location their preferences are matched with lister, and also questions like 'Are they fine with pets, etc' are aked to match the right lister.

In  order to improve the efficincy LocalForage to store the result matches once the user searches for a location. This is done to prevent any database queries made to mongodb when the user searches for the same location again.

In order to run this application run app.py and go to localhost:8000. Or you can visit the website hosted at rommiefinder.herokuapp.com
