var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoriteSchema = new Schema({
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

var Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;