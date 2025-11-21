import mongoose, {Schema} from "mongoose";

const productSchema= new Schema(
    {
        name:{
            type:String,
            required: true,   
        },
        description: {
            type:String,
            required:true,
        },
        category:  {
            type:String,
            required:true,
        },
        price:  {
            type:Number,
            required:true,
        },
        offerPrice:  {
            type:Number,
            required:true,
        },
        images:  {
            type:[String], 
            required:true,
        },
        inStock: {
            type:Boolean,
            required:true,
            default:true,
        },
        createdBy: {
            type:Schema.Types.ObjectId,
            ref: "User",
        },
    },{
        timestamps: true
    }
);


export default mongoose.model("Product", productSchema);