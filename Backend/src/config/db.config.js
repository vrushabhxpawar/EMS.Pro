import mongoose from 'mongoose'

const connectDB = async() => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log("DB Connected!")
    } catch (error) {
        process.exit(-1);
        console.log("Error while connecting DB", error)
    }
}

export default connectDB