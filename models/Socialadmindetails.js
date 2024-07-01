const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

email: {
type: String,
required: true,
unique:true,
lowercase: true,
},
phone: {
type: String,
required: true
},
fullName:{
type: String,
required: true
},
password:{
type: String,
required: true
},
address:{
    type: String,
    required: true  
},


});

const Socialadmindetails = mongoose.model('Socialadmindetails', userSchema);

module.exports = Socialadmindetails

