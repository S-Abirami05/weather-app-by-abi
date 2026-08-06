require("dotenv").config();
const supabase = require("./config/supabase");
const express = require('express');
const cors = require('cors');
 

const app = express();

app.use(cors());
app.use(express.json());

app.post('/save-weather', async (req, res) => {
  try {
    const { error } = await supabase
.from("weather_history")
.insert([
{
city: req.body.city,
temperature: req.body.temperature,
weather: req.body.weather,
humidity: req.body.humidity,
wind: req.body.wind
}
]);

if(error){
throw error;
}

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
const { data, error } = await supabase
.from("weather_history")
.select("*")
.order("searched_at", { ascending: false });

if(error){
throw error;
}

res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});