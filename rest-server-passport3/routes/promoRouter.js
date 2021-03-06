var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Verify = require('./verify');
var Promos = require('../models/promotions');


var promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')

.get(function (req, res, next) {

    Promos.find({}, function (err, promo) {
        if (err) next(err);
        res.json(promo);
    });

})

.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Promos.create(req.body, function (err, promo) {
        if (err) next(err);

        console.log('promo created!');
        var id = promo._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the promo with id:' + id);
    })

})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Promos.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    })

});

promoRouter.route('/:promoId')

.get(function (req, res, next) {

    Promos.findById(req.params.promoId, function (err, promo) {
        if (err) next(err);
        res.json(promo);
    })

})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Promos.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, {
        new: true
    }, function (err, promo) {
        if (err) next(err);
        res.json(promo);
    })

})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Promos.remove(req.params.promoId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    })

});

module.exports = promoRouter;