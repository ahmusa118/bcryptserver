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
type: String
},
fullName:{
type: String
},
password:{
type: String
},
method:{type:String},
city:{
    type: String
},
state:{
    type: String
},
address:{
    type: String
},
location:{type:String},
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
    nin:{
        type:Number
    }

});

const Socialuserdetails = mongoose.model('Socialuserdetails', userSchema);

module.exports = Socialuserdetails

