const Data = require('../models/data');

async function storeData(req, res) {
    console.log(req.body)
    const { content } = req.body;
    const userId = req.user.userId; // Extracted from the JWT token in middleware
  
    try {
      const data = new Data({ userId, content });
      await data.save();
      res.status(201).send('Data stored successfully.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  
  async function getData(req, res) {
    const userId = req.user.userId; // Extracted from the JWT token in middleware
  
    try {
      const userSpecificData = await Data.find({ userId });
      res.status(200).json(userSpecificData);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  
  async function deleteData(req, res) {
    const { dataId } = req.params;
  
    try {
      await Data.findOneAndDelete({ _id: dataId, userId: req.user.userId });
      res.status(200).send('Data deleted successfully.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

module.exports = { storeData, getData, deleteData };
