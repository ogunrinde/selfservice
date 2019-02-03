var mongoose = require('mongoose');
var templateSchema = new mongoose.Schema({
    year: {type: String},
    period : { type: String},
    appraisal: { type : Array},
    replies: [],
    remarks: {type : String},
    justifications: {type: String},
    admin_id: { type : String }
});
module.exports = mongoose.model('Templates', templateSchema);