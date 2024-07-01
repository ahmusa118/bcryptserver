const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({

email: {
type: String,
required: true,
unique:true
},
phone: {
type: String,
required: true
},
fullName:{
type: String
},
nin:{type:String},
location:{type:String},
address:{type:String},
state:{
    type: String
},
make:{type:String},
category:{type:String},
mileage:{type:Number},
year:{type:Number},
vin:{type:String},
color:{type:String},
price:{type:Number},
orderType:{type:String},
paid:{type:String,
default:'No'},
handled:{type:String,
    default:'No'},
requestno:{type:String,
    unique:true,
required:true},
charge:{type:Number},
acknowledge:{type:String, default:'No'},
editedBy:{type:String},
model:{type:String},
amountInWords:{type:String},
currencyType:{type:String},
timestamp:{type:Date,default:Date.now()}
});
const Orders = mongoose.model('Orders', carSchema);

module.exports =Orders

