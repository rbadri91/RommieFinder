var mongoose = require('mongoose');

var PostsSchema = mongoose.Schema({
    postType: String,
    imageUrl: [String],
    postDesc: String,
    postLocation : String,
    timestamp: String,
    user: mongoose.Schema.ObjectId
});

module.exports = mongoose.model('Posts', PostsSchema);