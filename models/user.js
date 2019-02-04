var mongoose = require('mongoose');
var bcryptNode = require('bcrypt-nodejs');
var userSchema = new mongoose.Schema({
    email: {type: String},
    name: {type : String},
    role: { type : String},
    department: {type : String},
    branch: {type : String},
    employee_ID : {type : String},
    password : { type: String},
    admin_id: { type : String},
    category : { type : String},
    company_name: { type : String},
    profile_image: { type : String},
    bManager : {type: String},
    lManager : { type : String},
    first_time_loggin: { type : String}
});
userSchema.methods.hashpassword = function(password){
    let hash = bcryptNode.hashSync(password);
    return hash;
}
userSchema.methods.comparepassword = function(password, hashedpassword){
    let compare =bcryptNode.compareSync(password,hashedpassword);
    return compare;
}
module.exports = mongoose.model('User', userSchema);