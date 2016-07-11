var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Verify = require('./verify');
var Favorites = require('../models/favorites');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .all(Verify.verifyOrdinaryUser)

.get(function (req, res, next) {

    Favorites.findOne({
            selectedBy: req.decoded._id
        })
        .populate('companies')
        .populate('selectedBy')
        .exec(function (err, favorite) {
            if (err) next(err);
            res.json(favorite);
        });

})



.post(function (req, res, next) {

    Favorites.findOne({
        selectedBy: req.decoded._id
    }, function (err, favorite) {
        if (err) next(err);

        if (!favorite) {
            favorite = new Favorites();
            favorite.selectedBy = req.decoded._id;
        }
        var idx = favorite.companies.indexOf(req.body._id);
        if (idx == -1) {
            favorite.companies.push(req.body._id);
        }

        favorite.save(function (error) {
            if (!error) {
                Favorites.find({
                        selectedBy: req.decoded._id
                    })
                    .populate('selectedBy')
                    .populate('companies')
                    .exec(function (err, favorite) {
                        if (err) next(err);
                        res.json(favorite);
                    })
            }
        });

    });
})

.delete(function (req, res, next) {

    Favorites.remove({
        selectedBy: req.decoded._id
    }, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    })

});

favoriteRouter.route('/:userId')
    .all(Verify.verifyOrdinaryUser)
    .get(function (req, res, next) {

    Favorites.findOne({
            selectedBy: req.params.userId
        })
        .populate('companies')
        .populate('selectedBy')
        .exec(function (err, favorite) {
            if (err) next(err);
            res.json(favorite);
        });

});

//assuming that if you can access this route this favorite company exist!
favoriteRouter.route('/:dishId')
    .all(Verify.verifyOrdinaryUser)
    .delete(function (req, res, next) {

//TO TRY
//        Favorites.remove({
//            'user': req.decoded._id,
//            'companies': req.params.dishObjectId
//        }, function (err, resp) {
//            if (err) next(err);
//            res.json(resp);
//        });


        Favorites.findOne({
            selectedBy: req.decoded._id
        }, function (err, favorite) {
            if (err) next(err);

            if (favorite == null) {
                // no stored favorites
                res.json(favorites);
                return;
            }

            // try to remove company from favorites
            var updatedList = favorite.companies.filter(company => company.toString() !== req.params.dishId);
            if (favorite.companies.length == updatedList.length) {
                // company wasn't in favorites
                res.json(favorite);
                return;
            }

            // save updated list
            favorite.companies = updatedList;
            if (favorite.companies.length == 0) {
                favorite.remove(function (err, favorite) {
                    if (err) next(err);
                    console.log('Updated Favorites!');
                    res.json(null);
                });
            } else {
                favorite.save(function (err, favorite) {
                    if (err) next(err);
                    console.log('Updated Favorites!');
                    res.json(favorite);
                });
            }



        });

    });

module.exports = favoriteRouter;