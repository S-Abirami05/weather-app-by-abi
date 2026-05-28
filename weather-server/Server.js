const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const Search = require('./models/Search');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

app.post('/save-weather', async (req, res) => {
  try {
    const newSearch = new Search(req.body);
    await newSearch.save();

    res.json({
      success: true,
      message: 'Weather saved'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.get('/history', async (req, res) => {
  try {
    const history = await Search.find().sort({ searchedAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});