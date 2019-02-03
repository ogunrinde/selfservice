var mongoose = require('mongoose');
var leaveSchema = new mongoose.Schema({
    company_name_id: {type: String},
    leave_type: {type: String},
    start_date: { type : String},
    end_date: { type : String},
    justification : { type : String},
    require_reliever : { type : String},
    reliever_source : { type : String},
    reliever_name : { type : String},
    reliever_email : { type : String},
    reliever_phone : { type : String},
    lManager_remark : { type : String},
    bManager_remark : { type : String},
    stage: {type:String},
    status: {type: String},
    date_created: {type :String},
    staff_id : {type : String},
    admin_id :{type : String},
    fstage : {type : String},
    date_created : {type : String}
});
module.exports = mongoose.model('leave', leaveSchema);