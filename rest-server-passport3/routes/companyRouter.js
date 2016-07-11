var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Verify = require('./verify');
var Companies = require('../models/companies');

var companyRouter = express.Router();
companyRouter.use(bodyParser.json());

companyRouter.route('/')

.get(function (req, res, next) {

    Companies.find(req.query)
        .populate('comments.postedBy')
        .exec(function (err, company) {
        if (err) next(err);
        res.json(company);
    });

})

.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Companies.create(req.body, function (err, company) {
        if (err) next(err);

        console.log('Company created!');
        var id = company._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the company with id:' + id);
    })

})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Companies.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    })

});

companyRouter.route('/:companyId')
.get(function (req, res, next) {

    Companies.findById(req.params.companyId)
        .populate('comments.postedBy')
        .exec(function (err, company) {
        if (err) next(err);
        res.json(company);
    })

})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Companies.findByIdAndUpdate(req.params.companyId, {
        $set: req.body
    }, {
        new: true
    }, function (err, company) {
        if (err) next(err);
        res.json(company);
    })

})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Companies.remove(req.params.companyId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    })

});

companyRouter.route('/:companyId/comments')
.get(function (req, res, next) {

    Companies.findById(req.params.companyId)
        .populate('comments.postedBy')
        .exec(function (err, company) {
        if (err) next(err);
        res.json(company.comments);
    })

})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {

    Companies.findById(req.params.companyId, function (err, company) {
        if (err) next(err);

        //get the postedBy id from the token!
        //req.body.postedBy = req.decoded._doc._id;
        //we don t need all info in order to reduce the token
        req.body.postedBy = req.decoded._id;
        
        company.comments.push(req.body);

        company.save(function (err, company) {
            if (err) next(err);
            console.log('Updated Comments!');
            res.json(company);
        })
    })

})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Companies.findById(req.params.dishId, function (err, company) {
        if (err) next(err);
        for (var i = (company.comments.length - 1); i >= 0; i--) {
            company.comments.id(company.comments[i]._id).remove();
        }
        company.save(function (err, result) {
            if (err) next(err);
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });

})

companyRouter.route('/:companyId/comments/:commentId')
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        Companies.findById(req.params.dishId)
            .populate('comments.postedBy')
            .exec(function (err, company) {
            if (err) next(err);
            res.json(company.comments.id(req.params.commentId));
        });
    })

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Companies.findById(req.params.dishId, function (err, company) {
        if (err) next(err);
        company.comments.id(req.params.commentId).remove();
        req.body.postedBy = req.decoded._id;
        company.comments.push(req.body);
        company.save(function (err, company) {
            if (err) next(err);
            console.log('Updated Comments!');
            res.json(company);
        });
    });
})

.delete(function (req, res, next) {
    Companies.findById(req.params.dishId, function (err, company) {

        if(company.comments.id(req.params.commentId).postedBy!= req.decoded._id){
            var err = new Error('You are not authorized to perform this operation!');
            err.status=403;
            return next(err);
        }
        
        company.comments.id(req.params.commentId).remove();
        company.save(function (err, resp) {
            if (err) next(err);
            res.json(resp);
        });
    });
});


module.exports = companyRouter;