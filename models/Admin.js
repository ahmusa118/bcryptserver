const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({

email: {
type: String,
required: true,
unique:true,
lowercase: true,
},
idno:{type:String,unique:true},
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
state:{
    type: String,
    required: true  
},
address:{
    type: String,
    required: true  
},
idimage:{
    type: String
},

});


const Admin = mongoose.model('Admin', adminSchema);

module.exports =Admin

