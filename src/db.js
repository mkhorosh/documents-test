const mongoose = require('mongoose');

const connectToMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://mongo:27017/contactsdb', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    }
}

const userSchema = new mongoose.Schema({
    phone: String,
    email: String,
    id: String,
    docs: {}
});

const User = mongoose.model('User', userSchema);

const saveDataToMongo = async (data) => {
    try {
        await User.create(data[0]);
        await User.insertMany(data);
        console.log('Contacts inserted successfully!');
    } catch (error) {
        console.error('Failed to insert contacts into MongoDB:', error);
    } finally {
        mongoose.connection.close();
    }
}

const processAndSaveData = async (data) => {
    await connectToMongoDB();
    await saveDataToMongo(data);
}

const getUserDocsByEmail = async (email) => {
    try {
        await connectToMongoDB();
        const user = await User.findOne({ email: email }).exec();

        if (!user) {
            return { status: 404, data: { message: 'User not found' } };
        }

        return {
            status: 200,
            data: {
                id: user.uuid,
                docs: user.docs || {}
            }
        };
    } catch (error) {
        console.error('Error fetching user documents:', error);
        return { status: 500, data: { message: 'Server error' } };
    }
}

module.exports = { connectToMongoDB, saveDataToMongo, processAndSaveData, getUserDocsByEmail };