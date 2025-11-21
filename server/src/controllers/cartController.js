import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

//add to cart
export const addToCart= async (req,res)=>{
    try {
        const {productId, quantity}= req.body;


        const product= await Product.findById(productId);
        if (!product)
            return res.status(404).json({message:"Product not found"});

        const exsistItem= await Cart.findOne({userId: req.user._id,productId});


        if(exsistItem){
            exsistItem.quantity+=quantity;
        await exsistItem.save();
        return res.json({message:"Cart updated", cart:exsistItem});

        }else{
        const cart = await Cart.create({
            userId: req.user._id,
            productId,
            quantity,
        });

        res.status(201).json({message:"Added to cart ", cart});
        }


    } catch (error) {
        res.status(500).json({ message:error.message});
    }
};

export const getCartDetail= async (req,res)=>{
    try {
        const cart= await Cart.find({userId:req.user._id})
            .populate({
                path: "productId",
                populate: {
                    path: "createdBy",
                    select: "_id username email"
                }
            });
        res.json(cart)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
};


export const removeItem= async(req,res)=>{
    try {
        const cartItem= await Cart.findById(req.params.id);
        if(!cartItem)
        return res.json({message:"Item not found"});

        await cartItem.deleteOne();
        res.json({message:"Item removed from cart"});
    } catch (error) {
        res.status(500).json({message:error.message})
    }
};



export const clearCart= async (req, res)=>{
    try {
        await Cart.deleteMany({userId: req.user._id});
        res.json({message:"Cart is cleared"})
    } catch (error) {
        res.json({message:error.message})
    }
}
