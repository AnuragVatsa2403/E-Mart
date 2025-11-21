import mongoose, { Schema } from "mongoose";

const orderItemSchema= new Schema({
    order:{
        type: Schema.Types.ObjectId,
        ref: "Order",

    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
    },
    quantity:{
        type: Number,

    }, 
    price:{
        type: Number,
    },
},{timestamps:true}
);


export default mongoose.model("OrderItems", orderItemSchema);