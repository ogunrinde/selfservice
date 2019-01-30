var mongoose = require('mongoose');
var templateSchema = new mongoose.Schema({
    year: {type: String},
    period : { type: String},
    appraisal: { type : Array},
    admin_id: { type : String }
});
module.exports = mongoose.model('Templates', templateSchema);