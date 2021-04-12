import React from "react";
import PropTypes from "prop-types";
import data from "./data/map-dimensions";
import State from "./components/State";

class Map extends React.Component {

  clickHandler = (stateAbbreviation) => {
    this.props.onClick(stateAbbreviation);
  };

  fillStateColor = (state) => {
    if (this.props.customize && this.props.customize[state] && this.props.customize[state].fill) {
      return this.props.customize[state].fill;
    }

    return this.props.defaultFill;
  };

  stateClickHandler = (state) => {
    if (this.props.customize && this.props.customize[state] && this.props.customize[state].clickHandler) {
      return this.props.customize[state].clickHandler
    }
    return this.clickHandler;
  }

  buildPaths = () => {
    let paths = [];
    let dataStates = data(this.props.country);
    for (let stateKey in dataStates) {
      const path = <State key={stateKey} stateName={dataStates[stateKey].name} dimensions={dataStates[stateKey]["dimensions"]} state={stateKey} fill={this.fillStateColor(stateKey)} onClickState={this.stateClickHandler(stateKey)} />
      paths.push(path);
    };
    return paths;
  };

  componentDidUpdate() {
    this.buildPaths();
  }

  render() {
    
    console.log("IN RENDER");
    var us_dc = 
    (<g className="DC state">
      <path className="DC1" fill={this.fillStateColor("DC1")} d="M801.8,253.8 l-1.1-1.6 -1-0.8 1.1-1.6 2.2,1.5z" />
      <circle className="DC2" onClick={this.clickHandler} data-name={"DC"} fill={this.fillStateColor("DC2")} stroke="#FFFFFF" strokeWidth="1.5" cx="801.3" cy="251.8" r="5" opacity="1" />
    </g>);
    var paths = this.buildPaths();

    var size = {
      "germany": "0 0 2000 1200",
      "poland": "0 0 1600 960",
      "united_states": "0 0 1000 600",
    }

    return (
      <view style={{aspectRatio: 1}}>
        <svg className="state-map" xmlns="http://www.w3.org/2000/svg" width={this.props.width} height={this.props.height} viewBox={size[this.props.country]}>
          <title>{this.props.title}</title>
          <g className="outlines">
            {paths}
            {this.props.country === "united_states" ? us_dc : ""}
          </g>
        </svg>
      </view>
    );
  }
}

Map.propTypes = {
  onClick: PropTypes.func.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  defaultFill: PropTypes.string,
  customize: PropTypes.object
};

Map.defaultProps = {
  onClick: () => {},
  width: 959,
  height: 593,
  defaultFill: "#D3D3D3",
  customize: {}
};

export default Map;
