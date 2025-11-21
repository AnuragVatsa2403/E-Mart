import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const pointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    // [lng, lat]
    type: [Number],
  },
}, { _id: false });

const userSchema= new Schema({
    username:{
        type: String,
        required: true,

    },
    email:{
        type: String,
        required: true,
        unique:true,
    },
    password:{
        type: String,
        required:true,
    },
    role:{
        type: String,
        enum: ["user", "shopkeeper"],
        default: "user",
    },
    location: {
        type: pointSchema,
        default: null,
    },
    addresses: [
        {
            name: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            zip: String,
        },
        ],

    refreshToken:{
        type:String,
    },
    
},{timestamps: true}
);


userSchema.index({ location: "2dsphere" });

//password hashing
userSchema.pre("save", async function (next){
    if(!this.isModified("password"))
        return next();

    this.password= await bcrypt.hash(this.password,10)
    next();
});


userSchema.methods.matchPassword= async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};

export default mongoose.model("User",userSchema);