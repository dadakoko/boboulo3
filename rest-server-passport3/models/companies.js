//grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

var companySchema = new Schema({
    address: {
        type: String,
        required:true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    featured:{
        type: Boolean,
        default:false
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

//the schema is useless so far
//we need to create a model using it
var Companies = mongoose.model('Company', companySchema);

//make this available to our Node applications
module.exports = Companies;