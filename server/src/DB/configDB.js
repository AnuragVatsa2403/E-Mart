import mongoose from "mongoose";


const connectDb= async ()=>{
    try {
        const connectioninstance= await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
        console.log (`MongoDb is connected!!!  DB host: ${connectioninstance.connection.host}`);
    } catch (error) {
        console.log("mongoDb connection Failed!!!",error);
        process.exit(1);
    }
}


export default connectDb;