const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({

        customerfullName:{type:String,required:true},
        customeremail:{type:String,required:true},
        customerphone:{type:String,required:true},
        location:{type:String,required:true},
        timestamp:{type:Date, default:Date.now()},
        inspectoremail:{type:String,required:true},
        requestno:{type:String,required:true},
        decision:{type:String,
        default:'pending'},
        inspectedBy:{type:String, required:true},
        images:{type:[String]},
        price:{type:String,required:true},
        make:{type:String,required:true},
        mileage:{type:String,required:true}
});


const Messages = mongoose.model('Messages', messageSchema);

module.exports =Messages

