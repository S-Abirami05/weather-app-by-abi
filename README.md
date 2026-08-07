React Weather App 🌦️

A modern React-based Weather Application with live weather updates, city search suggestions, backend integration, and MongoDB database storage.

Features

* 🌍 Search weather by city name
* 🔍 Auto city suggestions
* 🌡️ Live temperature updates
* 💨 Wind speed display
* 💧 Humidity information
* 🌤️ Dynamic weather icons
* 🖼️ Dynamic background images based on weather
* 📦 Backend API using Express.js
* 🗄️ MongoDB Compass database integration
* 📱 Responsive modern UI
* ⚡ Fast performance using Vite

Technologies Used

Frontend

* React.js
* Vite
* CSS3
* Lucide React Icons

Backend

* Node.js
* Express.js
* Supabase 
  

Project Structure

weather-app/
│
├── backend/
│   ├── models/
│   │   └── Search.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── vite.config.js
└── README.md

Installation

Clone Repository

git clone <your-github-repo-link>

Frontend Setup

Install Dependencies

npm install

Run Frontend

npm run dev

Install Backend Dependencies

npm install



MongoDB Compass Setup

Open MongoDB Compass and connect using:

mongodb://127.0.0.1:27017/weatherappDB

Database name:

weatherapp

Collection name:

searches

Future Improvements

* 7-day weather forecast
* User authentication
* Favorite cities
* Dark / Light theme
* Weather charts
