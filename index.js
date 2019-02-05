var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('express-flash');
var fileUpload = require('express-fileupload');
var Mongostore = require('connect-mongo')(session);
var port = process.env.PORT || 8080;
var app = express();
//mongodb://<dbuser>:<dbpassword>@ds139725.mlab.com:39725/testsdb
//mongodb://localhost:27017/passportlocal
//mongoose.connect('mongodb://localhost:27017/passportlocal', { useNewUrlParser: true });
mongoose.connect('mongodb://omotayoselfservice:schoolselfservice1@ds139725.mlab.com:39725/testsdb', { useNewUrlParser: true });

app.set('view engine' , 'ejs');
var route = require('./route');
require('./config/passport');
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());
console.log("okay");
app.use(session({
    secret: 'mysecretsessionkey',
    resave: true,
    saveUninitialized: true,
    store: new Mongostore({mongooseConnection:mongoose.connection})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use('/',route);

app.listen(port, function(){
    console.log('Listening on port  8080');
})
