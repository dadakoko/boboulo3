var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var applicationSchema = new Schema({
    companyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }
})

var User = new Schema({
    username: String,
    password: String,
    OauthId: String,
    OauthToken: String,
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    picture: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    applications: [applicationSchema]
});

User.methods.getName = function () {
    return (this.firstname + ' ' + this.lastname);
};

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);