var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var applicationSchema = new Schema({
    companies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        }
    ],
    selectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

var Applications = mongoose.model('Application', favoriteSchema);

module.exports = Applications;