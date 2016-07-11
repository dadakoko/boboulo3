var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

mongoose.connect(config.mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function () {
    //we re connected
    console.log("Connected correctly to server");

});

var routes = require('./routes/index');
var users = require('./routes/users');
var companyRouter = require('./routes/companyRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var favoriteRouter = require('./routes/favoriteRouter');

var app = express();

//Secure traffic only
app.all('*',function(req,res,next){
    if(req.secure){
        return next();
    }
    res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
})

// apply this rule to all requests accessing any URL/URI
app.all('*', function(req, res, next) {
    // add details of what is allowed in HTTP request headers to the response headers
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', false);
    res.header('Access-Control-Max-Age', '86400');
    res.header('Access-Control-Allow-Headers', 'x-access-token, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    // the next() function continues execution and will move onto the requested URL/URI
    next();
});

// fulfils pre-flight/promise request
app.options('*', function(req, res) {
    res.sendStatus(200);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

//passport config
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/companies', companyRouter);
app.use('/promotions', promoRouter);
app.use('/leadership', leaderRouter);
app.use('/favorites', favoriteRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        //the client will know what to do with json not html
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});


module.exports = app;