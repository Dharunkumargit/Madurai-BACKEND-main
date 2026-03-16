import mongoose from "mongoose";

const IdcodeSchema = new mongoose.Schema({
    idname:{
        type: String,
        required: true
    },
    idcode:{
        type: String,
        required : true
    },
    codes:{
        type: Number,
        required : true
    },
});

const IdcodeModel = mongoose.model('idcodes',IdcodeSchema);

export default IdcodeModel;