var express = require('express');
const XSLX = require('xlsx');
var router = express.Router();
var Template = require('./models/templates');
const User = require('./models/user');
var passport = require('passport');
var Company = require('./models/company');
var nodemailer = require('nodemailer');
var Leave = require('./models/leave');
var Notifications = require('./models/notifications');
var atob = require('atob');
var btoa = require('btoa');
router.get('/', function (req,res){
    res.render('login', {message : req.flash('loginMessage')});
});
router.get("/register", function(req,res){
    res.render("register", {message : req.flash('RegisterMessage')});
});
router.get("/leave_request", function(req,res){
    res.render("leave_request", {user: req.user, title : 'Leave Request'});
});
router.post("/leave_request", isLoggedIn, function(req,res){
    leave =  new Leave();
    leave.leave_type = req.body.leave_type;
    leave.start_date = req.body.start_date;
    leave.end_date =  req.body.end_date;
    leave.justification = req.body.justification,
    leave.reliever = req.body.reliever;
    leave.require_reliever = req.body.require_reliever;
    leave.reliever_source = req.body.reliever_source;
    leave.reliever_name = req.body.reliever_name;
    leave.reliever_email = req.body.reliever_email;
    leave.reliever_phone = req.body.reliever_phone;
    leave.staff_id  = req.user._id;
    leave.stage = 'lManager';
    leave.status = 'pending';
    leave.fstage = 'pending';
    leave.lManager_remark = '';
    leave.bManager_remark = '';
    leave.admin_id = req.user.admin_id;
    leave.date_created = new Date().toISOString().slice(0, 10);
    leave.save(function(err, go_leave){
      if(err) throw err;
      req.flash('notify', 'Your Leave request has been sent to your line Manager');
      res.redirect('/notify');
    });
});
router.get("/notify", isLoggedIn, function(req,res){
   msg = ""+req.user.name+" of "+req.user.company_name+" has requested for leave, kindly click the below link to reply";
   btn = "<a href = 'http://https://selfserviceapp.herokuapp.com/view_leave_request/"+btoa(req.user._id)+"' style = 'padding: 7px;color:#fff;background-color:#4e73df;'>Click to see request</a>";
   let head = "<head><meta charset='utf-8'>"
            +"<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>"
            +"<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css' integrity='sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS' crossorigin='anonymous'>"
            +"</head>";
    let body = "<body style = 'overflow:hidden;'>"
            +"<script src='https://code.jquery.com/jquery-3.3.1.slim.min.js' integrity='sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo' crossorigin='anonymous'></script>"
            +"<script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js' integrity='sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut' crossorigin='anonymous'></script>"
            +"<script src='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js' integrity='sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k' crossorigin='anonymous'></script>"
            +"<div><div style = 'width: 100%;margin-left:auto;margin-right:auto;text-align:center;'><img src = 'http://multichase.com/wp-content/uploads/2016/10/Multichase-Logo-e1477363629953.jpg' style='width:70px;height:70px;padding:10px;'></div></div>"
            +"<div style = 'font-size: 15px;'>"+msg+"</div>"
            +"<div style = 'margin-top: 40px;margin-bottom: 50px;'>"+btn+"</div>"
            +"<div style = 'background-color:#4e73df;width:100%;padding: 20px;text-align:center;color:#fff'>Copyright 2019</div>"
            +"</body>"; 
   var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: 'ogunrindeomotayo@gmail.com',
              pass: 'christianlife'
            }
          });
          var mailOptions = {
            from: 'ogunrindeomotayo@gmail.com',
            to: ''+req.user.lManager+'',
            subject: 'Leave Request',
            html: '<html>'+head+' '+body+'</html>'
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              res.render("notify", {user: req.user, message: req.flash('notify'), title : 'Notifications'});
              //res.send(info.response);
            }
          });
});
router.get("/view_leave", isLoggedIn, function(req,res){
   Leave.find({admin_id : req.user._id}, function(err, leave){
     res.render("view_leave", {user: req.user, leave : leave, title  : 'View Leave'});
   });
});
router.get("/notifications", isLoggedIn, function(req,res){
    console.log(req.user);
   //Notifications.find({staff_id : req.user._id}, function(req,notification){
      res.render("notifications", {user: req.user, title  : 'Notifications'});
   //}); 
});
router.post("/update_leave_request",isLoggedIn, function(req,res){
    let status = req.body.category;
    let staff_id = req.body.staff_id;
    if(req.user.category == 'lManager'){
        Leave.findOneAndUpdate({staff_id: req.body.staff_id}, {$set:{lManager_remark:req.body.category}}, {new: true}, (err, doc) => {
            req.flash('message', 'Information received');
            res.render("notify_manager", {user: req.user, message : req.flash('message'),title : 'Notify Manager'});
         });
    }else {
        Leave.findOneAndUpdate({staff_id: req.body.staff_id}, {$set:{bManager_remark:req.body.category}}, {new: true}, (err, doc) => {
            req.flash('message', 'Information received');
            res.render("notify_manager", {user: req.user, message : req.flash('message'), title : 'Notify Manager'});
         }); 
    }
    
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
    else res.render('dashboard', {user:req.user, title  : 'Dashboard'});
});
router.get("/appraisal", isLoggedIn, function(req,res){
    Template.find({admin_id: req.user._id}, function(err, template){
       console.log(template);
       res.render("appraisal", {template_data : template, user: req.user, title  : 'Appraisal'});
    });
});
router.get("/drop_appraisal/:id", function(req,res){
  req.session.app_id = atob(req.params.id);
  Template.findByIdAndRemove({_id: req.session.app_id}, function(err, template){
        if(err) throw err;
       console.log(template);
       req.flash('appraisal_remove', 'One document Dropped');
       res.redirect('/drop');
    });
});
router.get("/suspend_appraisal/:id", function(req,res){
  Template.findByIdAndUpdate({admin_id: req.user._id}, function(err, template){
    req.flash('appraisal_suspend', 'One document Suspended');
   res.redirect('/suspend');
  });
});
router.get("/suspend", isLoggedIn, function(req,res){
    Template.find({admin_id: req.user._id}, function(err, template){
       console.log(template);
       res.render("suspend", {template_data : template, user: req.user, appraisal_suspend : req.flash('appraisal_suspend'), title  : 'Suspend Appraisal'});
    });
});
router.get("/drop", isLoggedIn, function(req,res){
    Template.find({admin_id : req.user._id}, function(err, temp){ 
        res.render("drop", {template_data : temp, user: req.user, appraisal_remove : req.flash('appraisal_remove'), title  : 'Drop Appraisal'});
    });
});
router.get("/query", function(req,res){
    User.find({admin_id : req.user._id}, function(err,staffs){
        console.log(staffs);
        res.render('query', {user: req.user, all_staff : staffs, message : req.flash('message'), title  : 'Query System'});
    });
});
router.get("/employee", function(req,res){
    console.log(req.user._id);
    User.find({admin_id : req.user._id}, function(err,staffs){
        console.log(staffs);
        res.render('employee', {user: req.user, all_staff : staffs, title  : 'Employee'});
    });
});
router.get("/each_details/:id", function(req,res){
    let id = req.params.id;
    console.log(id);
    req.flash('id', id);
    res.redirect('/employee_details');
});
router.get("/get_staff_appraisals/:id", function(req,res){
    req.session.param_id = req.params.id;
    res.redirect('/each_staff_appraisals');
});
router.get("/each_staff_appraisals", isLoggedIn, function(req,res){
    let id =  req.session.param_id;
    console.log(id);
    let staff_template = [];
    let l_seen = false;
    let b_seen =false;
    let staff_id;
    //console.log(req.user);
    Template.find({admin_id : req.user._id}, function(err, temp){
        //console.log(temp);
        temp.forEach(function(value){
            value.replies.forEach(function(staff){
                console.log(staff);
                if(staff.staff_id.toString() === id.toString()){
                    staff_template.push(value);
                    staff_id = staff.staff_id.toString();
                    b_seen = staff.bManager_remarks !== '' ? true : false;
                    l_seen = staff.lManager_remarks !== '' ? true : false;
                    //console.log(temp);
                }
            });
        });
         if(staff_id == undefined){
               req.flash('message',"Staff hasn't filled any appraisal");
               res.redirect('/query');
        }
        //console.log(staff_id);
        User.findOne({_id : staff_id}, function(err,user_details){
          console.log(user_details);
          res.render('each_staff_appraisals', {staff : user_details,  user:req.user, template_data : staff_template, b_seen :b_seen, l_seen :l_seen, title : 'Staff Appraisal'});
        });
        //console.log(staff_template);
        //console.log(staff_template[0].length);
        //res.send('oka');
    });
});
router.post('/dropApraisal', function(req,res){
     Template.findByIdAndRemove(req.body.id, function(err, deleted) { // doc here is actually err
         if(err) throw err;
         res.json({success : true});
      });
});
router.post('/suspendApraisal', function(req,res){
     Template.find({_id : req.body.id}, function(err, template){
        if(err) throw err;
        template.suspend = 'true';
         Template.findByIdAndUpdate(req.body.id, template, {new :true}, function(err, suspended) { // doc here is actually err
           if(err) throw err;
           res.json({success : true});
      });
     })
    
});
router.get("/get_staff_appraisals/:id", function(req,res){
    let id = req.params.id;
    //console.log(id);
    req.flash('id', id);
    res.redirect('/each_staff_appraisals');
});
router.get("/each_staff_filled_appraisal", function(req,res){
    let id = req.params.id;
    console.log(id);
    req.flash('id', btoa(id));
    res.redirect('/each_staff_filled_appraisal');
});
router.get("/employee_details", function(req,res){
    let id = req.flash('id')[0];
    console.log(id);
    User.findOne({_id : id}, function(err, user){
       
       res.render('employee_details', {user :req.user, this_user : user,title  : 'Employee Details'});
    });
});
router.get("/view_request", function(req,res){
    Leave.find({admin_id : req.user._id}, function(err,to_leave){
        if(err) throw err;
        date = { day_created : null, month_created : null, year_month : null };
        for (let i = 0; i < to_leave.length; i++){
            let month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG','SEPT', 'OCT', 'NOV', 'DEC'];
            let s_day = to_leave[i].start_date.split('-')[2];
            let s_month = month[parseInt(to_leave[i].start_date.split('-')[1])];
            let s_year = to_leave[i].start_date.split('-')[0];
            let e_day = to_leave[i].end_date.split('-')[2];
            let e_month = month[parseInt(to_leave[i].end_date.split('-')[1])];
            let e_year = to_leave[i].end_date.split('-')[0];
            let day_created = to_leave[i].date_created.split('-')[2];
            let month_created = month[parseInt(to_leave[i].date_created.split('-')[1])];
            let year_created = to_leave[i].date_created.split('-')[0];
            s_date = {day : s_day, month : s_month, year : s_year};
            e_date = {day : e_day, month : e_month, year : e_year};
            date[i] = {day_created : s_day, month_created:s_month, year_created:s_year,e_day : e_day, e_month:e_month, e_year:e_year};
            console.log(to_leave);
            //date_created.push({day_created : day_created, month_created:month_created, year_created:year_created});
        }
        res.render('view_request', {user :req.user, leave_data : to_leave, date : date, title : 'View Request'});
    });
});
router.post("/settings", isLoggedIn, function(req,res){
    res.render("settings", { user : req.user, title : 'Settings'});
});
router.get("/settings", isLoggedIn, function(req,res){
    res.render("settings", { user : req.user, message: req.flash('UploadFileMessage'), title  : 'Settings'});
});
router.get("/view_staff/:id", isLoggedIn, function(req,res){
    let id = req.params.id;
    Leave.findOne({staff_id :  atob(id)}, function(err,leave_data){
        if(err) throw err; 
        console.log(leave_data);
        req.flash('id', atob(id));
        res.redirect('/view_staff_leave');
    });
});
router.get("/view_staff_leave", isLoggedIn, function(req,res){
    let id = req.flash('id')[0];
    Leave.findOne({staff_id :  id}, function(err,leave_data){
        if(err) throw err; 
        res.render("view_staff_leave", { user : req.user, leave_data :leave_data, title  : 'View Staff Leave'});
    });
});
router.get("/staff_leave_request", isLoggedIn, function(req,res){
    Leave.find({staff_id : req.user._id}, function(err, leave){
        let s_date;
        let e_date;
        let date_created = [];
        leave.forEach(function(to_leave){
            let month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG','SEPT', 'OCT', 'NOV', 'DEC'];
            let s_day = to_leave.start_date.split('-')[2];
            let s_month = month[parseInt(to_leave.start_date.split('-')[1])];
            let s_year = to_leave.start_date.split('-')[0];
            let e_day = to_leave.end_date.split('-')[2];
            let e_month = month[parseInt(to_leave.end_date.split('-')[1])];
            let e_year = to_leave.end_date.split('-')[0];
            let day_created = to_leave.date_created.split('-')[2];
            let month_created = month[parseInt(to_leave.date_created.split('-')[1])];
            let year_created = to_leave.date_created.split('-')[0];
            s_date = {day : s_day, month : s_month, year : s_year};
            e_date = {day : e_day, month : e_month, year : e_year};
            //console.log(month[parseInt(to_leave.date_created.split('-')[1])]);
            date_created.push({day_created : day_created, month_created:month_created, year_created:year_created});
        });
        res.render("staff_leave_request", { user : req.user, leave : leave, date_created:date_created, title  : 'Staff Leave Request'});
        console.log(date_created);
        //res.render("staff_view_request", {date_created:date_created, all_leaves : leave, s_date : s_date, e_date : e_date, user : req.user});
    });
});
router.post("/view_appraisal", isLoggedIn, function(req,res){
    console.log(req.user._id);
    let id = req.user.category === 'staff' ? req.user.admin_id : req.user._id;
    Template.findOne({admin_id: id, year : req.body.year}, function(err, template){
        console.log(template.replies);
        if(req.user.category == 'staff'){
            let justifications = [];
            let remarks = [];
            for (let r = 0; r < template.replies.length; r++){
                if(template.replies.staff_id  == req.user._id) {
                    justifications = template.replies.justifications.split(";");
                    remarks = template.replies.remarks.split(";");
                }
            }
            res.render("view_appraisal", {appraisal : template.appraisal, appraisal_year : template.year,appraisal_id: template._id, user : req.user, justifications:justifications,remarks:remarks, title  : 'View Appraisal'});
        }else{
            res.render("view_appraisal", {appraisal : template.appraisal, appraisal_year : template.year,appraisal_id: template._id, user : req.user,title  : 'View Appraisal'});
        }
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
            branch = data.branch.join(";");
            res.render('admin_settings', { branch : branch, user: req.user, dept : dept, appraisal : appraisal, company_data: data, message: req.flash('UpdateMessage'), title  : 'Admin Settings'});
        }
        if(!data){
            dept = '';
            appraisal = '';
            branch = '';
            company_data = {company_name:null,logo:null, department : [], appraisal_flow:[], branch : []};
            res.render('admin_settings', {user: req.user, dept : dept, branch : branch,appraisal : appraisal, company_data:company_data, department : [], appraisal: [], message: req.flash('UpdateMessage'), title : 'Admin Settings' });
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
            data.branch = details.branch;
            User.findOne({_id : details.admin_id }, function(err, admin_data){
                if(err) throw err;
                data.admin_email  = admin_data.email;
                data.admin_id = admin_data._id;
                res.render('staff_settings', {user : req.user, data : data, message : req.flash('UpdateMessage'), title  : 'Staff Settings'});
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
    req.user.branch = req.body.user_branch != '' ? req.body.user_branch : req.user.branch;
    req.user.employee_ID = req.body.user_employee_ID != '' ? req.body.user_employee_ID : req.user.employee_ID;
    req.user.bManager = req.body.user_bManager != '' ? req.body.user_bManager : req.user.bManager;
    req.user.lManager = req.body.user_lManager != '' ? req.body.user_lManager : req.user.lManager;
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
                if(req.user.category == 'lManager' || req.user.category == 'bManager'){
                  req.flash('UpdateMessage','Your profile has been updated');
                  res.redirect('/account_setup');
                }
                req.flash('UpdateMessage','Your profile has been updated');
                res.redirect('/dashboard');
            });
        }else{
                req.flash('UpdateMessage','Your profile has been updated');
                res.redirect('/dashboard');
        }
        
    });
});
router.get('/reassign', function(req,res){
  let appraisal = [];
  Template.find({admin_id: req.user._id}, function(err, template){
          template.forEach(function(appraisal){
             for (let r = 0; r < appraisal.replies.length; r++){
                if(appraisal.replies[r].staff_response_to_lManager  == 'reject') {
                     User.findOne({_id:appraisalreplies[r].staff_id}, function(err, staff){
                        appraisal.replies[r].staff_id = staff.name;
                        appraisal.push(appraisal);
                     });
                }
            }
          });    
        res.render("reassign", {user : req.user, appraisal : appraisal, title  : 'Re-assign Apprisal'});
    });
});
router.post("/advanced_settings", isLoggedIn, updateUser, function(req,res){
    //let file = req.files.file === null ? null : req.files.file; 
    let dept = req.body.dept_list.split(";");
    let branch = req.body.branch.split(";");
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
       data.branch = branch;
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
        company_data.branch = branch.length > 0 ? branch : [];
        company_data.logo = 'upload.png';
        //company_data.appraisal_flow = appraisal.length > 0 ? appraisal : [];
        if(req.files.company_file !== undefined){
            ext = req.files.company_file.name.split('.')[1];
            let accept = ['png','jpg', 'jpeg'];
            state = accept.includes(ext);
            rename = Math.floor(Math.random() * 1000000000);
        }
        if(state == true) company_data.logo = rename+'.'+ext;
        company_data.save(function(err,company_info){
        if(err) throw err;
        if(req.files.company_file === undefined) {
            req.flash('UpdateMessage','Company details noted');
            res.redirect('/dashboard');
            return false;
        }
        req.files.company_file.mv(__dirname + '/public/images/'+rename+'.'+ext+'',function(err){
            if(err) throw err;
            req.flash('UpdateMessage','Company details noted');
            res.redirect('/dashboard');
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
     }else if(req.user.category === 'lManager' || req.user.category === 'bManager'){
        res.redirect('/manager_account');
     }
     else {
        res.redirect('/staff_settings');
     }
   });
});
router.get('/manager_account', function(req,res){
   res.render('manager_account');
});
router.get('/manager_view/:id', function(req,res){
    //receive staff_id and appraisal_id
    req.session.param = atob(req.params.id);
    res.redirect('/appraisal_manager_view');
 });
 /*
 router.get('/appraisal_manager_view', function(req,res){
    //let staff_id = req.flash('id')[0]; 
    //let apraisal_id = req.flash('appraisal_id')[0];
    let appraisal_id = '5c547c624e7659436433066e';
    Template.findOne({_id : appraisal_id}, function(err, temp){
        console.log(temp);
        res.render('appraisal_manager_view', {appraisal : temp});  
    });
 });*/
 router.get("/appraisal_manager_view", function(req,res){
    console.log(req.session.param);
    let param = req.session.param.split(';');
    let appraisal_id = param[1];
    console.log(appraisal_id);
    let staff_id =  param[0];
    let manager = param[2] == 'lManager' ? 'lManager' : 'bManager';
    let manager_email = param[4];
    let staff_email = param[3];
    Template.findOne({_id: appraisal_id}, function(err, template){
            console.log(template);
            let justifications = [];
            let remarks = [];
            let lManager_justification = [];
            let lManager_remarks = [];
            let bManager_justification = [];
            let bManager_remarks = [];
            for (let r = 0; r < template.replies.length; r++){
                if(template.replies[r].staff_id  == staff_id) {
                    justifications = template.replies[r].justifications.split(";");
                    remarks = template.replies[r].remarks.split(";");
                    if(template.replies[r].lManager_remarks != '') 
                      lManager_remarks = template.replies[r].lManager_remarks.split(";");
                    if(template.replies[r].lManager_justification != '')  
                      lManager_justification = template.replies[r].lManager_justification.split(";");
                    if(template.replies[r].bManager_remarks != '') 
                      bManager_remarks = template.replies[r].bManager_remarks.split(";");
                    if(template.replies[r].lManager_justification != '')  
                      bManager_justification = template.replies[r].bManager_justification.split(";");  
                }
            }
            
            res.render("appraisal_manager_view", {manager_email:manager_email, staff_email:staff_email, manager : manager, appraisal : template.appraisal, appraisal_year : template.year, staff_id :staff_id, appraisal_id: template._id, user : req.user,lManager_justification : lManager_justification, lManager_remarks : lManager_remarks,bManager_justification :bManager_justification, bManager_remarks:bManager_remarks, justifications:justifications,remarks:remarks});
    });
});
router.post('/process_manager_remark', function(req,res){
    console.log(req.body);
      let appraisal_id = req.body.app_id;
      let staff_id = req.body.staff_id;
      let manager = req.body.manager;
      let manager_email = req.body.manager_email;
      let staff_email = req.body.staff_email;
      let email = manager == 'bManager' ? staff_email : manager_email;
      if(manager == 'lManager'){
        msg = "Dear Manager,<br> A staff in your company has completed an appraisal, kindly click the button below for remark.<br> Thank you.";
        btn = "<a href = 'https://selfserviceapp.herokuapp.com' style = 'padding: 7px;color:#fff;background-color:#4e73df;cursor:pointer'>View Appraisal</a>";
    }else {
            msg = "Dear Staff,<br> Log In to self service to see your managers appraisals of you, kindly click the button below to Log In.<br> Thank you.";
            btn = "<a href = 'https://selfserviceapp.herokuapp.com' style = 'padding: 7px;color:#fff;background-color:#4e73df;'>Log In</a>";
      }
        let head = "<head><meta charset='utf-8'>"
                  +"<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>"
                  +"<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css' integrity='sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS' crossorigin='anonymous'>"
                  +"</head>";
        let body = "<body style = 'overflow:hidden;'>"
                  +"<script src='https://code.jquery.com/jquery-3.3.1.slim.min.js' integrity='sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo' crossorigin='anonymous'></script>"
                  +"<script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js' integrity='sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut' crossorigin='anonymous'></script>"
                  +"<script src='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js' integrity='sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k' crossorigin='anonymous'></script>"
                  +"<div><div style = 'width: 100%;margin-left:auto;margin-right:auto;text-align:center;'><img src = 'http://multichase.com/wp-content/uploads/2016/10/Multichase-Logo-e1477363629953.jpg' style='width:70px;height:70px;padding:10px;'></div></div>"
                  +"<div style = 'font-size: 15px;'>"+msg+"</div>"
                  +"<div style = 'margin-top: 40px;margin-bottom: 50px;'>"+btn+"</div>"
                  +"<div style = 'background-color:#4e73df;width:100%;padding: 20px;text-align:center;color:#fff'>Copyright 2019</div>"
                  +"</body>"; 
      let html = head+""+body; 
      Template.findOne({_id :appraisal_id}, function(err, template){
          //console.log(template);
          let remarks = req.body.remark.join(';');
          let justifications = req.body.justification.join(';');
          //let data = {staff_id : req.user._id, remarks : remarks, justifications:justifications,lManager_remarks : "", lManager_justification : "", bManager_remarks : "",  bManager_justification : ""};
          for (let r = 0; r < template.replies.length; r++){
            if(template.replies[r].staff_id  == staff_id) {
                if(manager == 'lManager'){
                    template.replies[r].lManager_remarks = req.body.remark.join(';');
                    template.replies[r].lManager_justification = req.body.justification.join(';');
                }else {
                    template.replies[r].bManager_remarks = req.body.remark.join(';');
                    template.replies[r].bManager_justification = req.body.justification.join(';');
                }
               
            }
          }
          Template.findByIdAndUpdate(template._id,template, {new: true}, function(err, updated){
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
                    to: email,
                    subject: 'Appraisal Completed',
                    html: '<html>'+html+'</html>'
                  };
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                      res.json({success: true});
                    }
                  });
      });
   });
  });
router.post('/responsetoManager',isLoggedIn, function(req,res){
    let position = parseInt(req.body.position);
    Template.findOne({_id : req.body.appraisal_id }, function(err, template){
        template.replies[position].staff_response_to_lManager = req.body.response;
        Template.findByIdAndUpdate(template._id,template, {new: true}, function(err, updated){
          res.redirect('/response_to_manager');
        });
    });
});
router.post('/response_to_manager',isLoggedIn, function(req,res){
    res.render('response_to_manager', {message : "Your response to your line Manager's remark and comment is noted and will process"});
})
router.post("/uploadFile", isLoggedIn, function(req,res){
    let file;
    let ext;

    if(req.body.year == undefined || req.body.year == ''){
        req.flash('UploadfileMessage', 'Please select the appraisal year');
        res.render("create_appraisal", {user:req.user, message : req.flash('UploadfileMessage'), title : "Create Appraisal"});
        return false;
    }
    else if(req.body.period == undefined || req.body.period == ''){
         req.flash('UploadfileMessage', 'Kindly select appraisal period');
         res.render("create_appraisal", {user:req.user, message : req.flash('UploadfileMessage'), title : "Create Appraisal"});
         return false;
    }
    let state = false;
    if(req.files.file !== undefined){
        file = req.files.file; 
        console.log(file.name);
        ext = file.name.split('.')[1];
        let accept = ['xlsx','csv'];
        state = accept.includes(ext);
    }
    console.log(state);
    if(state === false){
        req.flash('UploadfileMessage','Please Upload Excel file Only');
        res.render("create_appraisal", {user:req.user, message : req.flash('UploadfileMessage'), title : "Create Appraisal"});
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
      template.remarks = '';
      template.justifications = '';
      template.save(function(err){
      if(err) throw err;
        msg = "Your admin has uploaded an appraisal for the year, kindly log In to your account to complete the information";
        btn = "<a href = 'https://selfserviceapp.herokuapp.com' style = 'padding: 7px;color:#fff;background-color:#4e73df;cursor:pointer;'>Log In</a>";
        let head = "<head><meta charset='utf-8'>"
                  +"<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>"
                  +"<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css' integrity='sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS' crossorigin='anonymous'>"
                  +"</head>";
        let body = "<body style = 'overflow:hidden;'>"
                  +"<script src='https://code.jquery.com/jquery-3.3.1.slim.min.js' integrity='sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo' crossorigin='anonymous'></script>"
                  +"<script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js' integrity='sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut' crossorigin='anonymous'></script>"
                  +"<script src='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js' integrity='sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k' crossorigin='anonymous'></script>"
                  +"<div><div style = 'width: 100%;margin-left:auto;margin-right:auto;text-align:center;'><img src = 'http://multichase.com/wp-content/uploads/2016/10/Multichase-Logo-e1477363629953.jpg' style='width:70px;height:70px;padding:10px;'></div></div>"
                  +"<div style = 'font-size: 15px;'>"+msg+"</div>"
                  +"<div style = 'margin-top: 40px;margin-bottom: 50px;'>"+btn+"</div>"
                  +"<div style = 'background-color:#4e73df;width:100%;padding: 20px;text-align:center;color:#fff'>Copyright 2019</div>"
                  +"</body>"; 
          let html = head+""+body; 
          var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: 'ogunrindeomotayo@gmail.com',
              pass: 'christianlife'
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            }
          });
          let email= '';
          User.find({admin_id : req.user._id}, function(err,users){
            users.forEach(function(user){
              if(email != '') ',';
               email += user.email;
            });
            console.log(email);
            if (email == '') email = 'ogunrindeomotayo@gmail.com';
            var mailOptions = {
            from: 'ogunrindeomotayo@gmail.com',
            to: ''+email+'',
            subject: 'Appraisal Review',
            html: '<html>'+head+''+body+'</html>'
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              req.flash('UploadfileMessage','File Uploaded Successfully, Staffs will be notified by mail');
              res.redirect('/create_appraisal');
              //res.send(info.response);
            }
          });
          });
      });
    });
});
router.get('/staff_appraisal', isLoggedIn, function(req,res){
    let appraisal = [];
    let q = 0;
    let msg;
    Template.find({admin_id : req.user.admin_id}, function(err,appra){
        appra.forEach(function(app){
            console.log(app);
            for(let r = 0; r < app.replies.length; r++){
               if(app.replies[r].staff_id != req.user._id) {
                q++;
                console.log(q);
                //q++;
                }
            }
             if(app.replies.length == 0) appraisal.push(app);
            else if(q < app.replies.length) appraisal.push(app);
            else if(q == app.replies.length) msg = 'The administrator is yet to upload new appraisal';
        });
        res.render("staff_appraisal", { user: req.user, appraisal : appraisal, msg : msg, title : 'Staff Appraisal'});
    }); 
});
router.get("/create_appraisal", isLoggedIn, function(req,res){
    res.render("create_appraisal", { user: req.user, message : req.flash('UploadfileMessage'), radio : req.user.category, title : "Create Appraisal"});
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
function template_fn(req,res, next) {
    let msg;
    let btn;
       btn = "<form action = 'http://localhost:3000' method = 'post'><input class= 'btn btn-primary' style = 'background-color:#4e73df;padding:14px 16px;color:#fff;' type = 'submit' value = 'Log In'/></form>";
       msg = 'Your company administrator has uploaded an appraisal for the year, kindly log In to your account to complete the information';
    if(req.body.leave_type){
      console.log(req.user.name);
      msg = ""+req.user.name+" of "+req.user.company_name+" has requested for leave, kindly click the below link to reply";
      btn = "<a href = 'http:localhost:3000/complete_form/"+btoa(req.user._id)+"' style = 'padding: 7px;color:#fff;background-color:#4e73df;'></a>";
    }
    let head = "<head><meta charset='utf-8'>"
            +"<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>"
            +"<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css' integrity='sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS' crossorigin='anonymous'>"
            +"</head>";
    let body = "<body style = 'overflow:hidden;'>"
            +"<script src='https://code.jquery.com/jquery-3.3.1.slim.min.js' integrity='sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo' crossorigin='anonymous'></script>"
            +"<script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js' integrity='sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut' crossorigin='anonymous'></script>"
            +"<script src='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js' integrity='sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k' crossorigin='anonymous'></script>"
            +"<div><div style = 'width: 100%;margin-left:auto;margin-right:auto;text-align:center;'><img src = 'http://multichase.com/wp-content/uploads/2016/10/Multichase-Logo-e1477363629953.jpg' style='width:70px;height:70px;padding:10px;'></div></div>"
            +"<div style = 'font-size: 15px;'>"+msg+"</div>"
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
router.get("/log", template_fn, function(req,res){
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
router.get('/femi', function(req,res){
     let r = "http://localhost:8080/view_applied_leave/"+btoa(req.user._id)+"";
    let e = "5c573909e3d4dc4754ff9e6e;5c5744aa3df7ce43c0f9e5e1;lManager;james@gmail.com;temmytp22005@gmail.com";
    let convert = btoa(e);

    //let f = atob('NWM1NDc4NWNkYmM3YzYzM2U4OTBjYzgwOzVjNTVkYTA5NjJhYWI1M2M4ODUzZTBlMTtsTWFuYWdlcjtqYW1lc0BnbWFpbC5jb20=');
    console.log(atob(convert));
    res.send(r);
})
router.post('/process_data', function(req,res){
  console.log(req.body);
  let param = req.user._id+";"+req.body.appraisal_id+";lManager"+req.user.email+""+req.user.bManager;
  let e = "5c54785cdbc7c633e890cc80;5c55da0962aab53c8853e0e1;lManager;james@gmail.com";
  let convert = btoa(param);
  msg = "Dear Manager,<br> A staff in your company has completed an appraisal, kindly click the button below for remark.<br> Thank you.";
  btn = "<a href = 'https://selfserviceapp.herokuapp.com/manager_view/"+convert+" style = 'padding: 7px;color:#fff;background-color:#4e73df;'>View Appraisal</a>";
  let head = "<head><meta charset='utf-8'>"
  +"<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>"
  +"<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css' integrity='sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS' crossorigin='anonymous'>"
  +"</head>";
    let body = "<body style = 'overflow:hidden;'>"
    +"<script src='https://code.jquery.com/jquery-3.3.1.slim.min.js' integrity='sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo' crossorigin='anonymous'></script>"
    +"<script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js' integrity='sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut' crossorigin='anonymous'></script>"
    +"<script src='https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js' integrity='sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k' crossorigin='anonymous'></script>"
    +"<div><div style = 'width: 100%;margin-left:auto;margin-right:auto;text-align:center;'><img src = 'http://multichase.com/wp-content/uploads/2016/10/Multichase-Logo-e1477363629953.jpg' style='width:70px;height:70px;padding:10px;'></div></div>"
    +"<div style = 'font-size: 15px;'>"+msg+"</div>"
    +"<div style = 'margin-top: 40px;margin-bottom: 50px;'>"+btn+"</div>"
    +"<div style = 'background-color:#4e73df;width:100%;padding: 20px;text-align:center;color:#fff'>Copyright 2019</div>"
    +"</body>"; 
    let html = head+""+body; 
    let id = req.user.category === 'staff' ? req.user.admin_id : req.user._id;
    Template.findOne({_id : req.body.appraisal_id }, function(err, template){
        //console.log(template);
        let remarks = req.body.remark.join(';');
        let justifications = req.body.justification.join(';');
        let data = {staff_id : req.user._id, remarks : remarks, justifications:justifications,lManager_remarks : "", lManager_justification : "", bManager_remarks : "",  bManager_justification : "", staff_response_to_lManager :""};
        template.replies.push(data);
        //console.log(template);
        Template.findByIdAndUpdate(template._id,template, {new: true}, function(err, updated){
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
                  to: req.user.lManager,
                  subject: 'Appraisal Completed',
                  html: '<html>'+html+'</html>'
                };
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                    res.json({success: true});
                    //res.redirect('/dashboard');
                    //res.send(info.response);
                  }
                });
    });
 });
});
router.get('/responsemsg',function(req,res){
   res.render('responsemsg', {user : req.user, title : 'Response Message'});
});
router.post('/view_filled_appraisal',function(req,res){
    console.log(req.body.appraisal_id);
    let set_id =  req.body.appraisal_id;
    Template.findOne({_id : req.body.appraisal_id}, function(err, template){
        console.log(req.user.category);
        if(req.user.category == 'staff' || req.user.category == 'admin'){
            let justifications = [];
            let remarks = [];
            let lManager_remarks = [];
            let lManager_justification = [];
            let bManager_remarks = [];
            let bManager_justification = [];
            let pos= 0;
            for (let r = 0; r < template.replies.length; r++){
                console.log(template.replies[r].staff_id);
                if(template.replies[r].staff_id.toString()  == req.body.staff_id.toString()) {
                    console.log(template.replies[r].justifications);
                    pos = r;
                    justifications = template.replies[r].justifications.split(";");
                    remarks = template.replies[r].remarks.split(";");
                    if(template.replies[r].lManager_justification !== '') 
                        lManager_justification = template.replies[r].lManager_justification.split(";");
                    if(template.replies[r].lManager_remarks !== '')
                        lManager_remarks = template.replies[r].lManager_remarks.split(";");
                    if(template.replies[r].bManager_justification !== '') 
                        bManager_justification = template.replies[r].bManager_justification.split(";");
                    if(template.replies[r].bManager_remarks !== '')
                        bManager_remarks = template.replies[r].bManager_remarks.split(";");
                }
            }
            console.log(justifications,remarks);
            res.render("view_filled_appraisal", {position : pos, appraisal : template.appraisal, appraisal_year : template.year,appraisal_id: template._id, user : req.user, justifications:justifications,remarks:remarks, lManager_justification:lManager_justification,lManager_remarks:lManager_remarks,bManager_justification:bManager_justification,bManager_remarks:bManager_remarks, title : 'View Appraisal' });
        }else{
            //console.log('qqqqqqqqqqqqqqqqq');
            res.render("view_filled_appraisal", {position : pos, appraisal : template.appraisal, appraisal_year : template.year,appraisal_id: template._id, user : req.user, lManager_justification:lManager_justification,lManager_remarks:lManager_remarks,bManager_justification:bManager_justification,bManager_remarks:bManager_remarks, title : 'View Appraisal'});
        }
    });
    //res.render('view_filled_appraisal');
 });
 router.post('/see_appraisal',function(req,res){
    console.log(req.body.user_id);
    Template.findOne({year : req.body.year}, function(err, template){
        console.log(req.user.category);
        if(req.user.category == 'staff' || req.user.category == 'admin'){
            //console.log('ooooooooooooooooooooooooooooooo');
            let justifications = [];
            let remarks = [];
            for (let r = 0; r < template.replies.length; r++){
                console.log(template.replies[r].staff_id);
                if(template.replies[r].staff_id.toString()  == req.body.user_id.toString()) {
                    console.log(template.replies[r].justifications);
                    justifications = template.replies[r].justifications.split(";");
                    remarks = template.replies[r].remarks.split(";");
                }
            }
            console.log(justifications);
            res.render("view_filled_appraisal", {appraisal : template.appraisal, appraisal_year : template.year,appraisal_id: template._id, user : req.user, justifications:justifications,remarks:remarks});
        }else{
            res.render("view_filled_appraisal", {appraisal : template.appraisal, appraisal_year : template.year,appraisal_id: template._id, user : req.user});
        }
    });
    //res.render('view_filled_appraisal');
 });
router.get('/each_request/:id', isLoggedIn,function(req,res){
  req.flash('id',req.params.id);
  res.redirect('/each_leave_request');
});
router.get('/each_leave_request', isLoggedIn,function(req,res){
    let id = req.flash('id')[0].toString();
    Leave.findOne({_id:id}, function(err,leave){
        User.findOne({_id: leave.staff_id}, function(err, user){
          res.render('each_leave_request', {leave : leave, user : user });
        });
    });
  });
  router.get('/view_leave_request/:id', isLoggedIn,function(req,res){
    req.session.leave_request_id = atob(req.params.id);
    res.redirect('/view_applied_leave'); 
  });
  router.get('/view_applied_leave',function(req,res){
    //let id = "5c54785cdbc7c633e890cc80";//req.flash('value')[0];
    let id = req.session.leave_request_id;
    Leave.findOne({staff_id : id}, function(req,leave){
            User.findOne({_id: leave.staff_id}, function(err, user){
              res.render('view_applied_leave', {leave_data : leave, user : user, title : 'View Applied Leave' });
            });
        }); 
  });
router.get('/filled_appraisal',function(req,res){
    let staff_template = [];
    let b_seen = false;
    let l_seen =false;
    let staff_id = '';
    console.log(req.user._id);
    Template.find({}, function(err, temp){
        //console.log(value.replies.staff_id);
        temp.forEach(function(value){
            //console.log(value);
            value.replies.forEach(function(staff){
                if(staff.staff_id.toString() === req.user._id.toString()){
                    staff_template.push(value);
                    staff_id = staff.staff_id.toString();
                    b_seen = staff.bManager_remarks !== '' ? true : false;
                    l_seen = staff.lManager_remarks !== '' ? true : false;
                }
                //console.log(staff.staff_id);
                //console.log(req.user._id);
            })
        });
         console.log(staff_template);
        if(staff_template == undefined)
          res.render('filled_appraisal', {user:req.user, appraisal : [], b_seen :b_seen,l_seen:l_seen, staff_id:staff_id, title : 'Filled Apraisal'});
        else
         res.render('filled_appraisal', {user:req.user, appraisal : staff_template, b_seen :b_seen,l_seen:l_seen, staff_id:staff_id, title : 'Filled Appraisal'});
    });
 });
module.exports = router;