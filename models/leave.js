var mongoose = require('mongoose');
var leaveSchema = new mongoose.Schema({
    company_name_id: {type: String},
    leave_type: {type: String},
    start_date: { type : String},
    end_date: { type : String},
    justification : { type : String},
    line_manager : { type : String},
    branch_manager : { type : String},
    reliever: {
        require_reliever : { type : String},
        reliever_source : { type : String},
        reliever_name : { type : String},
        reliever_emai : { type : String}
    },
    admin_id : {type : String},
    department: { type : Array},
    appraisal_flow: { type : Array}
});
module.exports = mongoose.model('leave', leaveSchema);