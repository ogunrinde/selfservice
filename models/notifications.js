var mongoose = require('mongoose');
var bcryptNode = require('bcrypt-nodejs');
var notificationSchema = new mongoose.Schema({
    source: {type: String},
    staff_id : { type: String},
    message : {type : String},
    date_created : {type : String}
});
module.exports = mongoose.model('Notification', notificationSchema);