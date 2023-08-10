import React from "react";
import LoadingSpinner from "./LoadingSpinner";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

//class components starts from here
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "jaipur",
      isLoading: false,
      displayLocation: "",
      weather: {},
    };
    this.getWeather = this.getWeather.bind(this);
  }

  async getWeather(location) {
    try {
      this.setState({ isLoading: true });
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
      );
      const geoData = await geoRes.json();
      console.log(geoData);

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);

      // Fetch the country's full name using the country code
      const countryRes = await fetch(
        `https://restcountries.com/v3.1/alpha/${country_code}`
      );
      const countryData = await countryRes.json();
      const fullCountryName = countryData[0].name.common;

      this.setState({
        displayLocation: `${name} ${convertToFlag(
          country_code
        )} (${fullCountryName})`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <div>
          <input
            type="text"
            placeholder="enter a location"
            value={this.state.location}
            onChange={(e) => this.setState({ location: e.target.value })}
          />
        </div>

        {this.state.isLoading ? (
          <LoadingSpinner />
        ) : (
          <button
            className="button"
            onClick={() => this.getWeather(this.state.location)}
          >
            {" "}
            get weather
          </button>
        )}
        {this.state.weather.weathercode && (
          <Weather
            weather={this.state.weather}
            location={this.state.displayLocation}
          />
        )}
      </div>
    );
  }
}

export default App;

class Weather extends React.Component {
  render() {
    console.log(this.props);

    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: code,
    } = this.props.weather;
    return (
      <div>
        <h2>Weather of {this.props.location}</h2>
        <ul className="weather">
          {dates.map((date, i) => (
            <Day
              code={code.at(i)}
              max={max.at(i)}
              min={min.at(i)}
              date={dates.at(i)}
              isToday={i === 0}
              key={date}
            />
          ))}
        </ul>
      </div>
    );
  }
}

class Day extends React.Component {
  render() {
    const { date, max, min, isToday, code } = this.props;
    return (
      <li className="day">
        <span>{getWeatherIcon(code)}</span>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>
          {min}&deg; &mdash; <strong>{max}&deg;</strong>
        </p>
      </li>
    );
  }
}
