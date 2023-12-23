const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    console.log("hello can i connect to idatabase")
    await mongoose.connect('mongodb+srv://careerretry123:gqcKxTDr0p9jF4wY@cluster0.182dkb4.mongodb.net/ps3project', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

module.exports = connectToDatabase;
// dG3ETcIhH8yFlnq2
