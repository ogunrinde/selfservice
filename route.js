var express = require('express');
const XSLX = require('xlsx');
var router = express.Router();
var Template = require('./models/templates');
const User = require('./models/user');
var passport = require('passport');
var Company = require('./models/company');
var nodemailer = require('nodemailer');


router.get('/', function (req,res){
    res.render('login', {message : req.flash('loginMessage')});
});
router.get("/register", function(req,res){
    res.render("register", {message : req.flash('RegisterMessage')});
});
router.get("/leave_request", function(req,res){
    res.render("leave_request");
});
router.get("/view_leave", function(req,res){
    res.render("view_leave");
});
router.get("/view_leave_Status", isLoggedIn, function(req,res){
    Leave.findById(req.user._id, function(err, details){
        res.render("view_leave_Status", {user: req.user, leave : details, message : req.flash('statusMessage')}); 
    });
});
router.get("/dashboard", isLoggedIn, function(req,res){
    if(req.user.first_time_loggin === '0') {
        req.user.first_time_loggin = '1';
        User.findByIdAndUpdate(req.user._id, req.user, {new: true}, function(err, user){
          res.redirect("/settings");
        });
    }
    else res.render('dashboard', {user:req.user});
});
router.get("/appraisal", isLoggedIn, function(req,res){
    Template.find({admin_id: req.user._id}, function(err, template){
       console.log(template);
       res.render("appraisal", {template_data : template});
    });
});
router.get("/query", function(req,res){
    res.render("query");
});
router.get("/employee_details", function(req,res){
    res.render("employee_details");
});
router.post("/settings", isLoggedIn, function(req,res){
    res.render("settings", { user : req.user});
});
router.get("/settings", isLoggedIn, function(req,res){
    res.render("settings", { user : req.user, message: req.flash('UploadFileMessage')});
});
router.post("/view_appraisal", isLoggedIn, function(req,res){
    console.log(req.user._id);
    let id = req.user.category === 'staff' ? req.user.admin_id : req.user._id;
    Template.find({admin_id: id, year : req.body.year}, function(err, template){
        res.render("view_appraisal", {appraisal : template[0].appraisal, appraisal_year : template[0].year,appraisal_id: template[0]._id, user : req.user});
    });
});
router.get("/admin_settings", isLoggedIn, function(req,res){
    Company.findOne({admin_id : req.user._id}, function(err,data){
        console.log(req.user);
        if(err) throw err;
        if(data){
            console.log(data);
            dept = data.department.join(";");
            appraisal = data.appraisal_flow.join(";");
            res.render('admin_settings', {user: req.user, dept : dept, appraisal : appraisal, company_data: data, message: req.flash('UpdateMessage')});
        }
        if(!data){
            dept = '';
            appraisal = '';
            company_data = {company_name:null,logo:null, department : [], appraisal_flow:[]};
            res.render('admin_settings', {user: req.user, dept : dept, appraisal : appraisal, company_data:company_data, department : [], appraisal: [], message: req.flash('UpdateMessage') });
        }
    });
});
router.get("/staff_settings", isLoggedIn, function(req,res){
    //console.log(req.user);
    Company.find({}, function(err, company){
        let data = {logo: null, admin_id: null, company_name : null, department: [], admin_email: null};
        company.forEach(function(details){
            //console.log(details);
           if(details.company_name == req.user.company_name) {
            data.logo = details.logo;
            data.company_name = details.company_name;
            data.department = details.department;
            User.findOne({_id : details.admin_id }, function(err, admin_data){
                if(err) throw err;
                data.admin_email  = admin_data.email;
                data.admin_id = admin_data._id;
                res.render('staff_settings', {user : req.user, data : data, message : req.flash('UpdateMessage')});
            });
           }
        });
    });
    //res.render('staff_settings', {user : req.user, company_data : company});
});
router.post("/staff_settings", isLoggedIn, function(req,res){
    let rename;
    let state;
    console.log(req.body.user_admin);
    req.user.name = req.body.user_name != '' ? req.body.user_name : req.user.name;
    req.user.admin_id =  req.body.user_admin_id != '' ? req.body.user_admin_id : req.user.admin_id;
    req.user.role = req.body.user_role != '' ? req.body.user_role : req.user.role;
    req.user.department = req.body.user_department != '' ? req.body.user_department : req.user.department;
    req.user.employee_ID = req.body.user_employee_ID != '' ? req.body.user_employee_ID : req.user.employee_ID;
    if(req.files.file !== undefined){
            ext = req.files.file.name.split('.')[1];
            let accept = ['png','jpg', 'jpeg'];
            state = accept.includes(ext);
            rename = Math.floor(Math.random() * 1000000000);
    }
    if(state === true){
            req.user.profile_image = state === true ?  rename+"."+ext : '';
    }
    User.findByIdAndUpdate(req.user._id, req.user, {new: true}, function(err, user){
        if(err) throw err;
        console.log(user);
        if(req.files.file !== undefined && state == true){
            req.files.file.mv(__dirname + '/public/images/'+rename+'.'+ext+'',function(err){
                if(err) throw err;
                req.flash('UpdateMessage','Your profile has been updated');
                res.redirect('/staff_settings');
            });
        }else{
                req.flash('UpdateMessage','Your profile has been updated');
                res.redirect('/staff_settings');
        }
        
    });
});
router.post("/advanced_settings", isLoggedIn, updateUser, function(req,res){
    //let file = req.files.file === null ? null : req.files.file; 
    let dept = req.body.dept_list.split(";");
    //let appraisal = req.body.appraisal_flow.split(";");
    let state;
    let ext;
    let rename;
    let renameprofile;
    let stateprofile;
    let extprofile;
    Company.findOne({admin_id : req.user._id}, function(err, data){
      if(err)  throw err;
      if(data){
       data.company_name = req.body.company_name === '' ? data.company_data : req.body.company_name;
       data.department = dept;
       //data.appraisal_flow = appraisal;
       Company.findByIdAndUpdate(data._id, data, {new: true}, function(err, user){
           if (err) throw err;
           //console.log(req.user);
           //req.user.department = req.body.department !== '' ? req.body.department : req.user.department;
           req.flash('UpdateMessage','Update Noted');
           res.redirect('/admin_settings');
           return false;
       });
      }
      if(!data){
          //console.log("am");
        if(req.body.company_name === '') {
            //console.log("am");
            req.flash('UpdateMessage','Please select Company Name');
            res.redirect('/admin_settings');
            return false;
        }
        //console.log(req.body);
        company_data = new Company();
        company_data.admin_id = req.user._id; 
        company_data.company_name = req.body.company_name;
        company_data.department = dept.length > 0 ? dept : [];
        company_data.logo = 'user_profile.png';
        //company_data.appraisal_flow = appraisal.length > 0 ? appraisal : [];
        if(req.files.file !== undefined){
            ext = req.files.file.name.split('.')[1];
            let accept = ['png','jpg', 'jpeg'];
            state = accept.includes(ext);
            rename = Math.floor(Math.random() * 1000000000);
        }
        if(state == true) company_data.logo = rename+'.'+ext;
        company_data.save(function(err,company_info){
        if(err) throw err;
        if(req.files.file === undefined) {
            req.flash('UpdateMessage','Company details noted');
            res.redirect('/admin_settings');
            return false;
        }
        req.files.file.mv(__dirname + '/public/images/'+rename+'.'+ext+'',function(err){
            if(err) throw err;
            req.flash('UpdateMessage','Company details noted');
            res.redirect('/admin_settings');
        });
      });
      }
    });  
});
function updateUser(req,res,next){
       req.user.name = req.body.name !== '' ? req.body.name : req.user.name;
       req.user.department = req.body.admin_dept !== '' ? req.body.admin_dept : req.user.department;
       //console.log(req.files.profile);
        if(req.files.profile !== undefined){
            let ext = req.files.profile.name.split('.')[1];
            let accept = ['png','jpg', 'jpeg'];
            let state = accept.includes(ext);
            let rename = Math.floor(Math.random() * 1000000000);
            req.user.profile_image = state === true ?  rename+"."+ext : req.user;
            User.findByIdAndUpdate(req.user._id, req.user, {new: true}, function(err, user){
                if(err) throw err;
                req.files.profile.mv(__dirname + '/public/images/'+rename+'.'+ext+'',function(err){
                    if(err) throw err;
                    next();
                });
            });
            
        }else {
            User.findByIdAndUpdate(req.user._id, req.user, {new: true}, function(err, user){
                if(err) throw err;
                next();
            });
        } 
}
router.post("/usercategory", isLoggedIn, function(req,res){
   req.user.category = req.body.category;
   console.log(req.body.category); 
   User.findByIdAndUpdate(req.user._id, req.user, {new: true}, function(err, user){
     if(err) throw err;
     if(req.user.category === 'admin') {
         res.redirect('/admin_settings');
     }else {
        res.redirect('/staff_settings');
     }
   });
});
router.post("/uploadFile", template, isLoggedIn, function(req,res){
    let file = req.files.file; 
    console.log(file.name);
    const ext = file.name.split('.')[1];
    let accept = ['xlsx','csv'];
    const state = accept.includes(ext);
    console.log(state);
    if(state === false){
        req.flash('UploadfileMessage','Please Upload Excel file Only');
        res.render("create_appraisal", { message : req.flash('UploadFileMessage')});
        return false;
    }
    const rename = Math.floor(Math.random() * 1000000000);
    file.mv(__dirname + '/public/files/'+rename+'.'+ext+'',function(err){
      if(err) throw err;
      const workbook =  XSLX.readFile(__dirname + '/public/files/'+rename+'.'+ext+'');
      const sheet_name_list = workbook.SheetNames;
      const doc = XSLX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
      template =  new Template();
      template.year = req.body.year;
      template.period = req.body.period;
      template.appraisal = doc;
      template.admin_id = req.user._id;
      template.save(function(err){
          if(err) throw err;
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ogunrindeomotayo@gmail.com',
              pass: 'christianlife'
            }
          });
          var mailOptions = {
            from: 'ogunrindeomotayo@gmail.com',
            to: 'omotayoogunrinde@gmail.com',
            subject: 'Appraisal Review',
            html: ''+req.user.template+''
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              req.flash('UploadfileMessage','File Uploaded Successfully, Staff will be notified by mail');
              res.redirect('/create_appraisal');
              //res.send(info.response);
            }
          });
         
      });
    });
});
router.get('/staff_appraisal', isLoggedIn, function(req,res){
    Template.find({admin_id : req.user.admin_id}, function(err,appraisal){
        res.render("staff_appraisal", { user: req.user, appraisal : appraisal});
    }); 
});
router.get("/create_appraisal", isLoggedIn, function(req,res){
    res.render("create_appraisal", { user: req.user, message : req.flash('UploadfileMessage'), radio : req.user.category});
});
router.post('/login', passport.authenticate('local.login', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}));
router.post('/register', passport.authenticate('local.signup', {
    successRedirect: '/register',
    failureRedirect: '/register',
    failureFlash: true
}));
function staff(req,res,next){
    let to_email = '';
    User.find({admin_id : req.user.admin_id}, function(err, result){
        result.forEach(function(value){
            if(to_email !== '') to_email += ',';
            to_email = value.email;
        });
        req.user['emails'] = to_email;
    });
    return next();
}
function template(req,res, next) {
    let msg;
    if(req.files.file !== null) {
       btn = "<form action = 'http://localhost:3000' method = 'post'><input class= 'btn btn-primary' style = 'background-color:#4e73df;padding:14px 16px;color:#fff;' type = 'submit' value = 'Log In'/></form>";
       msg = 'Your company administrator has uploaded an appraisal for the year, kindly log In to your account to complete the information';
    }
    let head = "<head><meta charset='utf-8'>"
            +"<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>"
            +"<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css' integrity='sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS' crossorigin='anonymous'>"
            +"</head>";
    let body = "<body><h1>Hello, world!</h1>"
            +"<script src='https://code.jquery.com/jquery-3.3.1.slim.min.js' integrity='sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo' crossorigin='anonymous'></script>"
            +"<script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js' integrity='sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut' crossorigin='anonymous'></script>"
            +"<script src='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js' integrity='sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k' crossorigin='anonymous'></script>"
            +"<div><div style = 'width: 100%;margin-left:auto;margin-right:auto;text-align:center;'><img src = 'http://multichase.com/wp-content/uploads/2016/10/Multichase-Logo-e1477363629953.jpg' style='width:70px;height:70px;padding:10px;'></div></div>"
            +"<div style = 'text-align:center;font-size: 15px;'>"+msg+"</div>"
            +"<div style = 'margin-top: 40px;margin-bottom: 50px;'>"+btn+"</div>"
            +"<div style = 'background-color:#4e73df;width:100%;padding: 20px;text-align:center;color:#fff'>Copyright 2019</div>"
            +"</body>"; 
    let html = head+""+body; 
    req.user['template'] = html;   
    return next();            
}
router.get("/logout", function(req,res){
    req.logout();
    req.redirect('/');
});
router.get("/log", template, function(req,res){
    console.log(req.user.template);
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ogunrindeomotayo@gmail.com',
          pass: 'christianlife'
        }
      });
      var mailOptions = {
        from: 'ogunrindeomotayo@gmail.com',
        to: 'omotayoogunrinde@gmail.com',
        subject: 'Sending Email using Node.js',
        html: ''+req.user.template+''
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.send(info.response);
        }
      });
});
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) return next();
    res.redirect('/');
}
router.get('/val', function(req,res){
  let j = [];
  j.push({name: 'game'});
  console.log(j);
});
router.post('/process_data', function(req,res){
    console.log(req.body);
    let id = req.user.category === 'staff' ? req.user.admin_id : req.user._id;
    Template.find({_id : req.body.appraisal_id }, function(err, template){
        template.remarks = req.body.remarks.join(';');
        template.justifications = req.body.justification.join(';');
        Template.findByIdAndUpdate(req.body.appraisal_id,template, {new: true}, function(err, updated){
            if(err) throw err;
            console.log(updated);
            res.json({success: true});
        });
    })

});
module.exports = router;