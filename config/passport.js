var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('../models/user');

passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function(id,done){
   User.findById(id, function(err,user){
     done(err,user);
   });
});

passport.use('local.signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    User.findOne({'email' : email}, function(err,user){
        if(err){
            return done(err);
        }
        if(user){
            req.flash('RegisterMessage', 'Email already exist, kindly proceed to Log In');
            return done(null,false);
        }
        var newUser = new User();
        newUser.email = req.body.email;
        newUser.password = newUser.hashpassword(req.body.password);
        newUser.company_name = req.body.company_name;
        newUser.category = 'staff';
        newUser.first_time_loggin = '0';
        newUser.role = '';
        newUser.department = '';
        newUser.name = '';
        newUser.employee_ID = '';
        newUser.company_name = req.body.company_name;
        newUser.save(function(err){
            if(err) {
                return done(err);
            }
            //console.log(newUser);
            req.flash('RegisterMessage', 'Account Created successfully, Kindly proceed to Log In');
            return done(null, newUser);
        })
    })
}));
passport.use('local.login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    User.findOne({'email' : email}, function(err,user){
        if(err){
            return done(err);
        }
        if(user){
            getUser = new User();
            const passState = getUser.comparepassword(password,user.password);
            if(passState === true) {
                return done(null,user);
            }else {
                req.flash('loginMessage', 'Username and Password do not Match');
                return done(null,false);
            }
            
        }
        if(!user){
            //console.log("aki");
            req.flash('loginMessage', 'User email not found');
            return done(null, false);
        }
    })
}));