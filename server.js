const express = require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes'); // Add this line
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

connectToDatabase();

app.use('/auth', authRoutes);
app.use('/data', dataRoutes); // Add this line
app.post('/fetch', async (req, res) => {
  var getArea =require('./authenticate');
  if(req.body.districtName){
    const districtName=req.body.districtName.toUpperCase();
    console.log(districtName);
    var ans=await getArea(districtName);
    res.json(ans);
  }
  else{
    res.json("Send a valid name");
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
