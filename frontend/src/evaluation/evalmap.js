import React, { Component } from "react";
import "./evalmap.css";
import Map from "./react-map";
//import USAMap from "react-usa-map"

const abbrStateMapping = { 
  "united_states": {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
    "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
    "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
    "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
  }, 
  "germany": {
    "BB": "Brandenburg", "BE": "Berlin", "BW": "Baden-Württemberg", "BY": "Bayern", "HB": "Bremen",
    "HE": "Hessen", "HH": "Hamburg", "MV": "Mecklenburg-Vorpommern", "NI": "Niedersachsen",
    "NW": "Nordrhein-Westfalen", "RP": "Rheinland-Pfalz", "SL": "Saarland", "SH": "Schleswig-Holstein",
    "SN": "Sachsen", "ST": "Sachsen-Anhalt", "TH": "Thüringen", 
  },
  "poland": {
    "DS": "Lower Silesian", "KP": "Kuyavian-Pomeranian", "LB": "Lubusz", "LD":"Łódź", "LU": "Lublin",
    "MA": "Lesser Poland", "MZ": "Masovian", "OP": "Opole", "PD": "Podlaskie", "PK": "Subcarpathian",
    "PM": "Pomeranian", "SK": "Holy Cross", "SL": "Silesian", "WN": "Warmian-Masurian", "WP": "Greater Poland",
    "ZP": "West Pomeranian"
  }
};

const stateAbbrMapping = { 
  "united_states": {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
    "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
    "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
  },
  "germany": {
    "Brandenburg": "BB", "Berlin": "BE", "Baden-Württemberg": "BW", "Bayern": "BY", "Bremen": "HB",
    "Hessen": "HE", "Hamburg": "HH", "Mecklenburg-Vorpommern": "MV", "Niedersachsen": "NI",
    "Nordrhein-Westfalen": "NW", "Rheinland-Pfalz": "RP", "Saarland": "SL", "Schleswig-Holstein": "SH",
    "Sachsen": "SN", "Sachsen-Anhalt": "ST", "Thüringen": "TH", 
  },
  "poland": {
    "Lower Silesian": "DS", "Kuyavian-Pomeranian": "KP", "Lubusz": "LB", "Łódź": "LD", "Lublin": "LU",
    "Lesser Poland": "MA", "Masovian": "MZ", "Opole": "OP", "Podlaskie": "PD", "Subcarpathian": "PK",
    "Pomeranian": "PM", "Holy Cross": "SK", "Silesian": "SL", "Warmian-Masurian": "WN", "Greater Poland": "WP",
    "West Pomeranian": "ZP"
  }
};

const evalmap = props => {
  const { clickHandler, region, country } = props;
  const mapHandler = event => {
    // console.log("TEST:\n" + JSON.stringify(event.target.dataset.name))
    // console.log("TEST:\n" + JSON.stringify(props));
    // console.log("TEST:\n" + abbrStateMapping[event.target.dataset.name]);
    clickHandler(abbrStateMapping[country][event.target.dataset.name]);
  };
  
  var map = <Map onClick={mapHandler} country={country} defaultFill="#c05555" width="30vw" height="50vh" />
  if (region !== "states") {
      //console.log("FILL:\n" + region);
      const abbr = stateAbbrMapping[country][region];
      const customizeFill = {};
      customizeFill[abbr] = {fill: "#c05555"};
      map = <Map onClick={mapHandler} customize={customizeFill} country={country} width="30vw" height="50vh" />
  }


  return (
    <div>
        {map}
    </div>
  );
};

export default evalmap;
