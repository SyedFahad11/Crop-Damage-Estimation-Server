const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

const Data = mongoose.model('Data', DataSchema);

module.exports = Data;
