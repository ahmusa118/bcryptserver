const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({

email: {
type: String,
required: true,

},
phone: {
type: String,
required: true
},
fullName:{
type: String,
required: true
},
location:{type:String},
address:{type:String},
state:{
    type: String,
    required: true  
},
make:{type:String},
category:{type:String},
mileage:{type:Number},
images:{type:[String]},
subType:{type:String, required:true},
price:{type:Number},
newPrice:{type:Number},
requestno:{type:String,
    unique:true},
year:{type:Number, required:true},
transmission:{type:String, required:true},
color:{type:String, required:true},
report:{type:String},
reportImage:{type:[String]},
carLocation:{type:String,required:true},
used:{type:String,required:true},
model:{type:String, required:true},
state:{type:String,
default:'Pending'},
timestamp:{type:Date, default:Date.now()}
});

const Cars = mongoose.model('Cars', carSchema);

module.exports =Cars

