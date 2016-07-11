var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');
var multer = require('multer');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');

/** API path that will upload the files */
router.post('/upload', Verify.verifyOrdinaryUser, function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        //save the path in mongodb
        console.log("filename : "+req.file.filename);
        User.findByIdAndUpdate(req.decoded._id, {
            $set: {"picture" : req.file.filename}
        }, {
                new: true
            }, function (err, user) {
                if (err) next(err);
                res.json(user);
        });
    });

});


/* GET users listing. */
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    User.find({}, function (err, user) {
        if (err) throw err;
        res.json(user);
    });

});

router.get('/profile', Verify.verifyOrdinaryUser, function (req, res, next) {

    User.findById(req.decoded._id)
        .exec(function (err, user) {
            if (err) next(err);
            res.json(user);
        })

});

router.post('/profile', Verify.verifyOrdinaryUser, function (req, res, next) {

    User.findByIdAndUpdate(req.decoded._id, {
        $set: req.body
    }, {
            new: true
        }, function (err, user) {
            if (err) next(err);
            res.json(user);
        })

});

router.get('/:userId',function (req, res, next) {

    User.findById(req.params.userId)
        .populate('applications.companyId')
        .exec(function (err, user) {
        if (err) next(err);
        res.json(user);
    })

});

router.put('/:userId',Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    User.findByIdAndUpdate(req.params.userId, {
        $set: req.body
    }, {
        new: true
    }, function (err, user) {
        if (err) next(err);
        res.json(user);
    });

});

router.delete('/:userId',Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    User.remove(req.params.userId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });

});



//we assume the client send the data in json
router.post('/register', function (req, res) {
    User.register(new User({
        username: req.body.username
    }), req.body.password, function (err, user) {
        if (err) {
            return res.status(500).json({
                err: err
            });
        }

        if (req.body.firstname) {
            user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
            user.lastname = req.body.lastname;
        }
        
        //user.applications.push({companyId:"573d97abe72f916d06562942"});

        user.save(function (err, user) {
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({
                    status: 'Registration Successful!'
                });
            });
        });

    });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        //passport make available this method on req
        req.logIn(user, function (err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }

            var token = Verify.getToken({ "username": user.username, "_id": user._id, "admin": user.admin });
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token
            });
        });
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    //we should destroy the token here
    res.status(200).json({
        status: 'Bye!'
    });
});

//passport.authenticate will redirect the user to facebook authorization server for user authentication
router.get('/facebook', passport.authenticate('facebook'),
    function (req, res) { });

//correspond to the callback we set in the config for facebook
router.get('/facebook/callback', function (req, res, next) {
    passport.authenticate('facebook', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            var token = Verify.getToken(user);
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token
            });
        });
    })(req, res, next);
});

module.exports = router;