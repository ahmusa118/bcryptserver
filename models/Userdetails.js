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
city:{
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
verification:{type:Number},
verified:{
    type: String,
    default:'No'
    },
    idimage:{
        type: String
    },
    utilityimage:{
        type: String
    },
    token:{
        type:Number,
        default:0
    },
    subType:{
        type:String
    }

});

const Userdetails = mongoose.model('Userdetails', userSchema);

module.exports = Userdetails

