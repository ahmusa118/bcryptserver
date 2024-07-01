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
},
fullName:{
type: String,
required: true
},
verification:{type:Number},
verified:{type:String, default:'No'},
password:{
type: String
},
city:{
    type: String
},
state:{
    type: String
},
address:{
    type: String
},
saved:{
    type:[{
        images:{type:[String]},
      requestno:{type:String},
        newPrice:{type:String},
        location:{type:String},
        make:{type:String},
        model:{type:String},
        year:{type:Number},
        mileage:{type:Number},
        address:{type:String},
        phone:{type:String}
    }]
},
requests:{
    type:[{
        customerfullName:{type:String},
        customeremail:{type:String},
        customerphone:{type:String},
        location:{type:String},
        timestamp:{type:Date, default:Date.now()},
        inspectoremail:{type:String},
        requestno:{type:String},
        decision:{type:String}
    }]
}


});

const Individualdetails = mongoose.model('Individualdetails', userSchema);

module.exports = Individualdetails

