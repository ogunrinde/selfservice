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
    else res.render('dashboard');
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
    Template.find({admin_id: req.user._id, year : req.body.year}, function(err, template){
        res.render("view_appraisal", {appraisal : template[0].appraisal});
    });
});
router.get("/admin_settings", isLoggedIn, function(req,res){
    Company.findOne({admin_id : req.user._id}, function(err,data){
        if(err) throw err;
        if(data){
            console.log(data);
            dept = data.department.join(";");
            appraisal = data.appraisal_flow.join(";");
            res.render('admin_settings', {user: req.user, dept : dept, appraisal : appraisal, company_data: data, message: req.flash('UploadFileMessage')});
        }
        if(!data){
            dept = '';
            appraisal = '';
            res.render('admin_settings', {user: req.user, dept : dept, appraisal : appraisal, company_data: {company_name : null, department : [], appraisal: []}, message: req.flash('UploadFileMessage')});
        }
    });
});
router.get("/staff_settings", isLoggedIn, function(req,res){
    Company.find({}, function(err, company){
        let data = {logo: null, admin_id: null, company_name : company_name};
        company.forEach(function(details){
           if(details.company_name == req.user.company_name) {
            data.logo = details.logo;
            data.company_name = details.company_name;
           }
        });
        User.findOne({company_name : data['company_name']}, function(err, admin_details){
           data['employee_ID'] = admin_details.employee_ID;
        });
        res.render('staff_settings', {user : req.user, company_data : data});
    });
    //res.render('staff_settings', {user : req.user, company_data : company});
});
router.post("/advanced_settings", isLoggedIn, function(req,res){
    //let file = req.files.file === null ? null : req.files.file; 
    let dept = req.body.dept_list.split(";");
    let appraisal = req.body.appraisal_flow.split(";");
    let state;
    let ext;
    let rename;
    //console.log(file.name);
    Company.findOne({admin_id : req.user._id}, function(err, data){
      if(err)  throw err;
      if(data){
          console.log(dept);
          console.log(appraisal);
       data.company_name = req.body.company_name === '' ? data.company_data : req.body.company_name;
       data.department = dept;
       data.appraisal_flow = appraisal;
       Company.findByIdAndUpdate(data._id, data, {new: true}, function(err, user){
           if (err) throw err;
           req.flash('UploadfileMessage','Update Noted');
           res.redirect('/admin_settings');
           return false;
       });
      }
      if(!data){
        if(req.body.company_name === undefined) {
            req.flash('UploadfileMessage','Please select Company Name');
            res.redirect('/admin_settings');
        }
        console.log(req.files);
        company_data = new Company();
        company_data.admin_id = req.user._id;
        company_data.company_name = req.body.company_name;
        company_data.department = dept.length > 0 ? dept : [];
        company_data.appraisal_flow = appraisal.length > 0 ? appraisal : [];
        if(req.files.file !== undefined){
            ext = req.files.file.name.split('.')[1];
            let accept = ['png','jpg', 'jpeg'];
            state = accept.includes(ext);
            rename = Math.floor(Math.random() * 1000000000);
        }
        if(state === true){
            company_data.logo = state === true ?  rename+"."+ext : '';
        }
        company_data.save(function(err,company_info){
        if(err) throw err;
        if(req.files.file === undefined) {
            req.flash('UploadfileMessage','Company details noted');
            res.redirect('/admin_settings');
            return false;
        }
        req.files.file.mv(__dirname + '/public/images/'+rename+'.'+ext+'',function(err){
            if(err) throw err;
            req.flash('UploadfileMessage','Company details noted');
            res.redirect('/admin_settings');
        });
    });
      }
    });
    
    
});
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
router.post("/uploadFile", isLoggedIn, function(req,res){
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
          req.flash('UploadfileMessage','File Uploaded Successfully');
          res.redirect('/create_appraisal');
      });
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
router.get('/email', function(req,res){
    let head = "<head><meta charset='utf-8'>"
            +"<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>"
            +"<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css' integrity='sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS' crossorigin='anonymous'>"
            +"</head>";
    let body = "<body><h1>Hello, world!</h1>"
            +"<script src='https://code.jquery.com/jquery-3.3.1.slim.min.js' integrity='sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo' crossorigin='anonymous'></script>"
            +"<script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js' integrity='sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut' crossorigin='anonymous'></script>"
            +"<script src='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js' integrity='sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k' crossorigin='anonymous'></script>"
            +"<div><div style = 'width: 100%;margin-left:auto;margin-right:auto;text-align:center;'><img src = 'http://multichase.com/wp-content/uploads/2016/10/Multichase-Logo-e1477363629953.jpg' style='width:70px;height:70px;padding:10px;'></div></div>"
            +"<div style = 'text-align:center;font-size: 15px;'>Please follow the link below to complete a form</div>"
            +"<div style = 'margin-top: 40px;margin-bottom: 50px;'><input class= 'btn btn-primary' style = 'background-color:#4e73df;padding:14px 16px;color:#fff;' type = 'submit' value = 'Link to form'/></div>"
            +"<div style = 'background-color:#4e73df;width:100%;padding: 20px;text-align:center;'>Copyright 2019</div>"
            +"</body>";        
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
        html: '<html>'+head+''+body+'</html>'
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
router.get("/logout", function(req,res){
    req.logout();
    req.redirect('/');
});
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) return next();
    res.redirect('/');
}
module.exports = router;