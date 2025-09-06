const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ecommerce:emperor234@node.m5ivxkf.mongodb.net/?retryWrites=true&w=majority&appName=node', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

    console.log("connected to alien Database");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;


