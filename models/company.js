var mongoose = require('mongoose');
var bcryptNode = require('bcrypt-nodejs');
var companySchema = new mongoose.Schema({
    company_name: {type: String},
    logo : { type: String},
    admin_id : {type : String},
    department: { type : Array},
    branch : {type : Array},
    appraisal_flow: { type : Array}
});
module.exports = mongoose.model('Company', companySchema);