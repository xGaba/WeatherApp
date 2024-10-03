import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import 'dotenv/config';

const app = express();
const port = process.env.PORT;
const appid = process.env.WEATHER_API_KEY;
const celsiusOp = 273.15;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", async (req, res) => {
  const city = req.body.search;
  try {
    //Take lattitude and longitude from the selected location, from Geo API
    const responseGeo = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${appid}`
    );
    const { lat, lon } = responseGeo.data[0];

    //Data taken from the weather API
    const responseWeather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appid}`
    );

    const currentTemp = parseFloat(
      (responseWeather.data.main.temp - celsiusOp).toFixed(1)
    );
    const minTemp = parseFloat(
      (responseWeather.data.main.temp_min - celsiusOp).toFixed(1)
    );
    const maxTemp = parseFloat(
      (responseWeather.data.main.temp_max - celsiusOp).toFixed(1)
    );
    const city_format = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const humidity = responseWeather.data.main.humidity;
    const weather_id = responseWeather.data.weather[0].id;
    const weather_main = responseWeather.data.weather[0].main;
    const weather_dscrp = responseWeather.data.weather[0].description;
    const weather_icon = responseWeather.data.weather[0].icon;

    const iconURL = `https://openweathermap.org/img/wn/${weather_icon}@2x.png`;

    res.render("index.ejs", {
      content: {
        city_format,
        currentTemp,
        minTemp,
        maxTemp,
        humidity,
        weather_id,
        weather_main,
        weather_dscrp
      },
      iconURL: iconURL,
    });
  } catch (error) {
    res.render("index.ejs", { error: `${city} doesn't exists` });
  }
});

app.listen(port, () => {
  console.log(`Running on port: ${port}.`);
});