import React, { Component } from "react";
import Evalgraph from "./evalgraph";
import Evalmap from "./evalmap";
import RankingTable from "./rankingTable";
import "./evaluation.css";
import { Form, Select, Row, Col, Radio, Slider } from "antd";
import FormItem from "antd/lib/form/FormItem";
import ReactGA from "react-ga";

const { Option } = Select;

// TODO: Add list of current regions to state and implement addRegion and removeRegion functions
const STATE_NAME_MAP = {
  "united_states": "United States",
  "germany": "Germany",
  "poland": "Poland"
}

const STATES = { "united_states": [
    "Washington",
    "Illinois",
    "California",
    "Arizona",
    "Massachusetts",
    "Wisconsin",
    "Texas",
    "Nebraska",
    "Utah",
    "Oregon",
    "Florida",
    "New York",
    "Rhode Island",
    "Georgia",
    "New Hampshire",
    "North Carolina",
    "New Jersey",
    "Colorado",
    "Maryland",
    "Nevada",
    "Tennessee",
    "Hawai",
    "Indiana",
    "Kentucky",
    "Minnesota",
    "Oklahoma",
    "Pennsylvania",
    "South Carolina",
    "District of Columbia",
    "Kansas",
    "Missouri",
    "Vermont",
    "Virginia",
    "Connecticut",
    "Iowa",
    "Louisiana",
    "Ohio",
    "Michigan",
    "South Dakota",
    "Arkansas",
    "Delaware",
    "Mississippi",
    "New Mexico",
    "North Dakota",
    "Wyoming",
    "Alaska",
    "Maine",
    "Alabama",
    "Idaho",
    "Montana",
    "Puerto Rico",
    "Virgin Islands",
    "Guam",
    "West Virginia",
    "Northern Mariana Islands",
    "American Samoa",
  ], 
  "germany": [
    "Brandenburg", "Berlin", "Baden-Württemberg", "Bayern", "Bremen",
    "Hessen", "Hamburg", "Mecklenburg-Vorpommern", "Niedersachsen",
    "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Schleswig-Holstein",
    "Sachsen", "Sachsen-Anhalt", "Thüringen"
  ],
  "poland": [
    "Kuyavian-Pomeranian", "Lubusz", "Łódź", "Lublin", "Lesser Poland",
    "Masovian", "Opole", "Podlaskie", "Subcarpathian", "Pomeranian",
    "Holy Cross", "Silesian", "Lower Silesian", "Warmian-Masurian", "Greater Poland",
    "West Pomeranian"
  ]
};

// TODO: Since we only have limited number of ML/AI methods, they are hardcoded here.
// Later we got to fetch this file from a file/online source.
const ML_MODELS = [
  "UMich_RidgeTfReg",
  "SIkJaun10_hyper7",
  "ensemble_SIkJa_RF",
  "SIkJaun1_window_noval",
  "SIkJaun1_hyper7_smooth7",
  "SIkJaun1_hyper7",
  "SIkJaun10_window_noval",
  "SIkJaun10_hyper7_smooth7",
];

class Evaluation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      country: "united_states",
      region: "states",
      filter: "all",
      humanMethods: [],
      mlMethods: [],
      methodList: [],
      allMethods: [],
      mainGraphData: {},
      rankingTableData: [],
      metrics: "MAE",
      metricsList: ["MAE", "MAPE (coming soon)", "RMSE (coming soon)"],
      forecastType: "state_death_eval",
      timeSpan: "avg",
      maxDateRange: [],
      selectedDateRange: [],
      jsonData: {},
      maeData: {},
      groundTruth: {},
      reset: 0,
    };
  }

  async componentDidMount() {
    //ReactGA.initialize("UA-186385643-2");
    //ReactGA.pageview("/covid19-forecast-bench/evaluation");
    this.formRef = React.createRef();

    this.loadJsonData();
    
    try{
      if(this.props.match.params !== undefined && this.props.location.state!== undefined){
          const {handle} = this.props.match.params;
          const {disease} = this.props.location.state;
          //console.log("test")
          //console.log(disease);
        }
      }
      finally{
        //console.log("Load Complete");
      }
  };
  fillJsonMaeMethods = (jsonResult) => {
    var methodList = [];
    var jsonData = {};
    var maeData = {};
    Object.keys(jsonResult).forEach(function(key) {
        jsonData[key] = jsonResult[key];
        maeData[key] = jsonResult[key];
        methodList.push(key);
      });
    var jsonValues = [jsonData, maeData, methodList];
    return jsonValues;
  };

  fillGroundTruth = (gtResult) =>{
    
    var groundTruth = {};

    Object.keys(gtResult).forEach(function(key) {
      groundTruth[key] = gtResult[key];
    });
    return groundTruth;
  }



  fetchJsonData = json_url => {


    return fetch(json_url).then(response => response.json()).catch((error) => {
      console.error(error)
    });
  };

  fetchGTData = gt_url => {
  
    return fetch(gt_url).then(response => response.json()).catch((error) => {
      console.error(error)
    });
  };

  promiseJsonData (json_url, gt_url) {
    return Promise.all([this.fetchJsonData(json_url), this.fetchGTData(gt_url)]);
  };

  loadJsonData = () => {
    var json_url = "https://raw.githubusercontent.com/alexyin1/covid19-forecast-bench/master/json-data/state-death.json";
    var gt_url = "https://raw.githubusercontent.com/alexyin1/covid19-forecast-bench/master/json-data/US_death_gt.json";
    
    this.promiseJsonData(json_url, gt_url).then((
      [jsonResult, gtResult]) => {

        var jsonValues = this.fillJsonMaeMethods(jsonResult);
        var groundTruth = this.fillGroundTruth(gtResult);
        console.log(jsonValues);
        var jsonData = jsonValues[0];
        var maeData = jsonValues[1];
        var methodList = jsonValues[2];
        this.setState({
          jsonData: jsonData,
          maeData: maeData,
          methodList: methodList,
          groundTruth: groundTruth},
        function() {
          // if (methodList.length == 0) {
          //   console.log("utter failure");
          // }
          this.resolveMAE(jsonData, maeData, methodList, groundTruth);
        });
    });
  };

  calculateMAE = (jsonData, maeData, methodList, groundTruth) => {
    for (var method in methodList) {
      // console.log("methodList is good");
      var methodName = methodList[method];
      for (var weeks = 1; weeks <= 4; weeks++) {
        for (var date in jsonData[methodName][weeks]) {
          // console.log("dates are good");
          var points = jsonData[methodName][weeks][date];
          if (groundTruth[date] && points) {
            var raw_y;
            var gt_y;
            for (var reg in points) {
              // console.log("reg is good");
              raw_y = parseInt(points[reg]);
              gt_y = parseInt(groundTruth[date][reg]);
              if (raw_y != "null" &&  gt_y != "null") {
                maeData[methodName][weeks][date][reg] = Math.abs(raw_y-gt_y);
                // console.log("changed");

              }
              else {
                maeData[methodName][weeks][date][reg] = "null";
                // console.log("changed");
              }
            }
          }
        }
      }
    }
    return maeData;
  };

  resolveMAE = (jsonData, maeData, methodList, groundTruth) => {
    var maeDataSolved = Promise.resolve(this.calculateMAE(jsonData, maeData, methodList, groundTruth));
    maeDataSolved.then((maeData) => {
      this.setState({
        maeData: maeData},
      function() {
        this.updateData();
      });
    });
  };

  initialize = () => {
    console.log("initialize");
    this.setState({
      selectedDateRange: this.state.maxDateRange,
      reset: 1
      },
    function() {
      this.formRef.current.setFieldsValue({dateRange: [0, this.getTotalNumberOfWeeks()]});
      this.addMethod("reich_COVIDhub_ensemble");
      this.addMethod("ensemble_SIkJa_RF");
      //this.reloadAll();
      this.generateRanking();
    });
  };

  updateData = () => {
    var jsonData = this.state.jsonData;
    let maxDateRange = [undefined, undefined];
    let anchorDatapoints = { maeData: [] };
    let oldMaxRange = this.state.maxDateRange;

    // More json data needed to complete this function for Germany/Poland

    Object.keys(jsonData).forEach(function(method) {
      for (var date in jsonData[method][1]) {
        if (jsonData[method][1][date] && !maxDateRange[0]) { maxDateRange[0] = date; }
        if (jsonData[method][1][date] && !maxDateRange[1]) { maxDateRange[1] = date; }
        if (jsonData[method][1][date] && date < maxDateRange[0]) {
          maxDateRange[0] = date;
        }
        if (jsonData[method][1][date] && date > maxDateRange[1]) {
          maxDateRange[1] = date;
        }
      }
    });

    if (oldMaxRange[0] != maxDateRange[0] || oldMaxRange[1] != maxDateRange[1]) {
      var anch_data = [];

      var anch_start = new Date(maxDateRange[0]);
      var anch_end = new Date(maxDateRange[1]);
      anch_start.setDate(anch_start.getDate() - 7);
      anch_end.setDate(anch_end.getDate() + 7);

      anch_data.push({x: this.getDateInFormat(anch_start), y: 0});
      anch_data.push({x: this.getDateInFormat(anch_end), y: 0});
      anch_data.push({x: this.getDateInFormat(anch_end), y: 200});
      
      anchorDatapoints.dataSeries = anch_data;

      this.setState({
        mainGraphData: { anchorDatapoints },
        maxDateRange: maxDateRange},
      function() {
        if (this.state.reset == 0) {
          this.initialize();
        }
        else {
          this.reloadAll();
        }
      });
    }
    //this.generateRanking();
    
  };

  // goes through each method and grabs the data relative the parameters set
  graphData = method => {
    var timeSpan = this.state.timeSpan;
    var region = STATES[this.state.country].findIndex(obj => obj === this.state.region);
    var localFilter = this.isMLMethod(method) ? "ml":"human";
    var graph_data = [];

    if (localFilter == this.state.filter || this.state.filter == "all") {
      // average of predictions
      if (timeSpan == "avg") {
        while (this.state.maeData[method].length == 0) {}
        for (var date in this.state.maeData[method][1]) {
          let sum = 0;
          let total = 0;
          for (var weeks = 1; weeks <= 4; weeks++) {
            if (this.state.maeData[method][weeks][date]) {
              if (region == -1) {
                for (var reg in this.state.maeData[method][weeks][date]) {
                  let y = parseInt(this.state.maeData[method][weeks][date][reg]);
                  if (!isNaN(y)) {
                    sum += y;
                    total++;
                  }
                }
              }
              else {
                let y = parseInt(this.state.maeData[method][weeks][date][region]);
                if (!isNaN(y)) {
                  sum += y;
                  total++;
                }
              }
            }
          }
          let displayDate = new Date(date);
          if (total > 0) {
            graph_data.push({x: this.getDateInFormat(displayDate), y: (sum / total)});
          }
        }
      }
      else {
        while (this.state.maeData[method].length == 0) {}
        for (var date in this.state.maeData[method][timeSpan]) {
          let displayDate = new Date(date);
          if (region == -1) {
            let total = 0;
            let sum = 0;
            for (var reg in this.state.maeData[method][timeSpan][date]) {
              let y = parseInt(this.state.maeData[method][timeSpan][date][reg]);
              if (!isNaN(y)) {
                sum += y;
                total++;
              }
            }
            if (total > 0) {
              graph_data.push({x: this.getDateInFormat(displayDate), y: (sum / total)});
            }
          }
          else {
            graph_data.push({x: this.getDateInFormat(displayDate), y: this.state.maeData[method][timeSpan][date][region]});
          }
        }
      }
    }
    //console.log(this.state.maeData);
    console.log(graph_data);
    return graph_data;
  };

  generateRanking = () => {
    var timeSpan = this.state.timeSpan;
    var region = STATES[this.state.country].findIndex(obj => obj === this.state.region); // changed from US_STATES to STATES[this.state.country]

    let baselineAverageMAE = this.state.maeData["reich_COVIDhub_baseline"];
    let methodList = this.state.methodList;

    var rankingTableData = [];
    let cutOff = 0;
   
    for (var method in methodList) {
      var methodName = methodList[method];
      var localFilter = this.isMLMethod(methodName) ? "ml" :"human";
      var methodType = this.isMLMethod(methodName) ? "ML/AI" : "Human-Expert";

      let forecastCount = 0;
      let fromSelectedStartDate = false;
      let upToSelectedEndDate = false;
      let updating = false;
      let sum = 0;
      let total = 0;
      let baseline_sum = 0;
      let averageMAE = 0;
      let baselineMAE = 0;
      let relativeMAE = 0;
      let min_date = new Date(this.state.selectedDateRange[0]);
      let max_date = new Date(this.state.selectedDateRange[1]);

      if (localFilter == this.state.filter || this.state.filter == "all") {
        Promise.resolve(this.getMethodMAE(methodName)).then((methodMAE) => {
          console.log(methodMAE);
          if (timeSpan == "avg") {
            for (var date in methodMAE[1]) {
              let curr_date = new Date(date);
              if (curr_date >= min_date && curr_date <= max_date) {
                forecastCount++;
                for (var weeks = 1; weeks <= 4; weeks++) {
                  if (methodMAE[weeks][date] && baselineAverageMAE[weeks][date]) {
                    if (region == -1) {
                      for (var reg in methodMAE[weeks][date]) {
                        let y = parseInt(methodMAE[weeks][date][reg]);
                        let y2 = parseInt(baselineAverageMAE[weeks][date][reg]);
                        if (!isNaN(y) && !isNaN(y2)) {
                          sum += y;
                          total++;
                          baseline_sum += y2;
                        }
                      }
                    }
                    else {
                      let y = parseInt(methodMAE[weeks][date][region]);
                      let y2 = parseInt(baselineAverageMAE[weeks][date][region]);
                      if (!isNaN(y) && !isNaN(y2)) {
                        sum += y;
                        total++;
                        baseline_sum += y2;
                      }
                    }
                  }
                }
              }
              if( forecastCount > cutOff){
                cutOff = forecastCount;
              }
              if (curr_date == min_date) {
                fromSelectedStartDate = true;
              }
              if (curr_date == max_date) {
                upToSelectedEndDate = true;
              }
              if (curr_date == new Date(this.state.maxDateRange[1])) {
                updating = true;
              }
            }
          }
          else {
            //while (this.state.maeData[methodName].length == 0) {}
            for (var date in methodMAE[timeSpan]) {
              let curr_date = new Date(date);
              if (curr_date >= min_date && curr_date <= max_date) {
                forecastCount++;
                if (methodMAE[timeSpan][date] && baselineAverageMAE[timeSpan][date]) {
                  if (region == -1) {
                    for (var reg in methodMAE[timeSpan][date]) {
                      let y = parseInt(methodMAE[timeSpan][date][reg]);
                      let y2 = parseInt(baselineAverageMAE[timeSpan][date][reg]);
                      if (!isNaN(y) && !isNaN(y2)) {
                        sum += y;
                        total++;
                        baseline_sum += y2;
                      }
                    }
                  }
                  else {
                    let y = parseInt(methodMAE[timeSpan][date][region]);
                    let y2 = parseInt(baselineAverageMAE[timeSpan][date][region]);
                    if (!isNaN(y) && !isNaN(y2)) {
                      sum += y;
                      total++;
                      baseline_sum += y2;
                    }
                  }
                }
              }
              if( forecastCount > cutOff){
                cutOff = forecastCount;
              }
              if (curr_date == min_date) {
                fromSelectedStartDate = true;
              }
              if (curr_date == max_date) {
                upToSelectedEndDate = true;
              }
              if (curr_date == new Date(this.state.maxDateRange[1])) {
                updating = true;
              }
            }
          }
  
          if( forecastCount != 0){
            const fitWithinDateRange = fromSelectedStartDate && upToSelectedEndDate;
            averageMAE = (sum / total).toFixed(2);
            baselineMAE = (baseline_sum / total);
            relativeMAE = (averageMAE / baselineMAE).toFixed(3);
            if (methodName === "reich_COVIDhub_baseline") {
              relativeMAE = 1;
            }
    
            if (forecastCount && (cutOff == forecastCount)) {
              rankingTableData[methodName] = {methodName, methodType, averageMAE, relativeMAE, forecastCount, fitWithinDateRange, updating};
            }
          }
        });
      }
    }
    this.setState({rankingTableData: rankingTableData});
  };

  getMethodMAE = (method) => {
    var methodMAE = {}
    for (var weeks = 1; weeks <= 4; weeks++) {
      methodMAE[weeks] = this.state.maeData[weeks];
    }
    return methodMAE;
  }
  

  methodIsSelected = method => {
    if (this.state.allMethods && method) {
      return this.state.allMethods.includes(method);
    }
    return false;
  };

  doesMethodFitFilter = (method, filter) => {
    if (filter === "ml") {
      return ML_MODELS.includes(method);
    } else if (filter === "human") {
      return !ML_MODELS.includes(method);
    }
    return true;
  };

  isMLMethod = method => {
    return this.doesMethodFitFilter(method, "ml");
  };

  addMethod = method => {
    if (this.methodIsSelected(method)) {
      return;
    }

     const methodDataSeries = this.graphData(method);
     const methodGraphData = { dataSeries: methodDataSeries };

    this.setState(
      prevState => {
        return {
          allMethods: [...prevState.allMethods, method],
          mainGraphData: {
            ...prevState.mainGraphData,
            [method]: methodGraphData,
          },
        };
      },
      () => {
        this.formRef.current.setFieldsValue({
          methods: this.state.allMethods,
        });
        console.log(this.state.mainGraphData);
      }
    );
  };

  removeMethod = targetMethod => {
    if (targetMethod === " ") {
      return;
    }
    let humanMethods = this.state.humanMethods;
    let mlMethods = this.state.mlMethods;
    let allMethods = this.state.allMethods;

    if (!this.isMLMethod(targetMethod)) {
      humanMethods = humanMethods.filter(method => method !== targetMethod);
    } else {
      mlMethods = mlMethods.filter(method => method !== targetMethod);
    }
    allMethods = allMethods.filter(method => method != targetMethod);

    this.setState(prevState => {
      return {
        humanMethods: humanMethods,
        mlMethods: mlMethods,
        allMethods: allMethods,
        mainGraphData: Object.keys(prevState.mainGraphData)
          .filter(method => method !== targetMethod)
          .reduce((newMainGraphData, method) => {
            return {
              ...newMainGraphData,
              [method]: prevState.mainGraphData[method],
            };
          }, {}),
      };
      console.log(this.state.mainGraphData);
    });
  };

  onValuesChange = (changedValues, allValues) => {
    const prevMethods = this.state.allMethods;
    const newMethods = allValues.methods;
    if (newMethods && prevMethods) {
      const methodsToAdd = newMethods.filter(
        method => !prevMethods.includes(method)
      );
      const methodsToRemove = prevMethods.filter(
        method => !newMethods.includes(method)
      );

      methodsToAdd.forEach(this.addMethod);
      methodsToRemove.forEach(this.removeMethod);
    }
  };

  reloadAll = () => {
    const prevMethods = this.state.allMethods;
    this.setState(
      {
        humanMethods: [],
        mlMethods: [],
        allMethods: [],
      },
      () => {
        prevMethods.forEach(this.addMethod);
        this.generateRanking();
      }
    );
  };

  handleForecastTypeSelect = type => {
    this.setState({
      forecastType: type
    });
    this.updateData();
  };


  handleErrorTypeSelect = e => {
    this.setState({
      errorType: e.target.value,
    });
  };

  handleTimeSpanSelect = e => {
    this.setState({
      timeSpan: e.target.value,
    });
    this.updateData();
  };

  handleRegionChange = newRegion => {
    console.log("REGIONCHANGE:\n" + this.state.region + "\n" + newRegion);
    this.setState({
      region: newRegion,
    });

    this.updateData();

    this.formRef.current.setFieldsValue({
      region: this.state.region,
    });
  };

  handleFilterChange = e => {
    this.setState({
      filter: e.target.value,
    });

    this.updateData();
  };

  getTotalNumberOfWeeks = () => {
    const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;
    const start = new Date(this.state.maxDateRange[0]);
    const end = new Date(this.state.maxDateRange[1]);
    var result = (end.getTime() - start.getTime()) / MS_PER_WEEK;
    return result;
  }

  getDateFromWeekNumber = weekNum => { // WeekNum is the number of weeks since the maxDateRange[0].
    if (this.state.maxDateRange[0]) {
      const date = new Date(this.state.maxDateRange[0]);
      date.setDate(date.getDate() + 7 * weekNum);
      return this.getDateInFormat(date);
    }
    return null;
  }

  getDateInFormat = date => {
    return ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '-' + date.getFullYear();
  }

  handleDateRangeChange = e => {
    const start = this.getDateFromWeekNumber(e[0]);
    const end = this.getDateFromWeekNumber(e[1]);
    // console.log([start, end]);
    this.setState({
      selectedDateRange: [start, end]
    });
    this.updateData();
  }

  handleCountryChange = e => {
    this.setState({
      country: e
    });
    this.updateData();
  }

  render() {
    const {
      country,
      filter,
      humanMethods,
      mlMethods,
      allMethods,
      methodList,
      region,
      metrics,
      metricsList,
      timeSpan,
      mainGraphData,
      rankingTableData,
      maxDateRange,
      selectedDateRange
    } = this.state;

    const methodOptions = methodList
      .filter(method => !this.methodIsSelected(method))
      .filter(method => this.doesMethodFitFilter(method, filter))
      .sort()
      .map(s => {
        return <Option key={s}> {s} </Option>;
      });

    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    const regionOptions = [];
    regionOptions.push(
      <Option value="states" key="0">
        {STATE_NAME_MAP[country]} Average
      </Option>
    );
    STATES[country].forEach((state, index) => {
      //console.log("STATE:\n" + state);
      regionOptions.push(
        <Option value={state.replace(" ", "%20")} key={index + 1}>
          {state}
        </Option>
      );
    });

    return (
      <div className="leader-page-wrapper">
        <div className="evaluation-container">
          <div className="control-container">
            <Row type="flex" justify="space-around">
              <Col span={12}>
                <Form
                  {...formLayout}
                  ref={this.formRef}
                  onValuesChange={this.onValuesChange}
                >
                  
                  <Form.Item label="Forecast Country" name="forecastCountry">
                    <Select showSearch defaultValue="united_states" onChange={this.handleCountryChange}>
                      <Option value="germany">
                        Germany
                      </Option>
                      <Option value="poland">
                        Poland
                      </Option>
                      <Option value="united_states">
                        United States
                      </Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Forecast Type" name="forecastType">
                    <Select showSearch defaultValue="state_death_eval" onChange={this.handleForecastTypeSelect}>
                      <Option value="state_death_eval">
                        COVID-19 US state-level death forecasts
                      </Option>
                      <Option value="state_case_eval">
                        COVID-19 US state-level case forecasts
                      </Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Region" name="region">
                    <Select
                      showSearch
                      placeholder="Select a region"
                      defaultValue={region}
                      onChange={this.handleRegionChange}
                    >
                      {regionOptions}
                    </Select>
                    </Form.Item>

                    <Form.Item label="Highlight" name="filter">
                    <Radio.Group
                      defaultValue="all"
                      onChange={this.handleFilterChange}
                    >
                      <Radio.Button value="all">All Methods</Radio.Button>
                      <Radio.Button value="ml">ML/AI Methods</Radio.Button>
                      <Radio.Button value="human">
                        Human-Expert Methods
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>


                  <Form.Item label="Methods" name="methods">
                    <Select mode="multiple" placeholder="Select Methods">
                      {methodOptions}
                    </Select>
                  </Form.Item>
                  {/* TODO: The metrics options have not been implemented. */}
                  <Form.Item label="Metrics" name="metrics">
                    <Select showSearch defaultValue="MAE">
                      {metricsList.map((m, idx) => (
                        <Option value={m} key={idx}>
                          {m}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Prediction Time Span" name="timeSpan">
                    <Radio.Group
                      value={timeSpan}
                      defaultValue={"avg"}
                      onChange={this.handleTimeSpanSelect}
                    >
                      <Radio value="avg">Average over 4 weeks</Radio>
                      <Radio value="1">1 week ahead</Radio>
                      <Radio value="2">2 week ahead</Radio>
                      <Radio value="3">3 week ahead</Radio>
                      <Radio value="4">4 week ahead</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item label="Prediction Date Range" name="dateRange">
                    <Slider
                     range
                     tooltipVisible
                     tooltipPlacement="bottom"
                     max={this.getTotalNumberOfWeeks()}
                     tipFormatter={this.getDateFromWeekNumber}
                     onAfterChange={this.handleDateRangeChange}
                     />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </div>
          <Row type="flex" justify="space-around">
            <div className="evalmap-container">
              <Evalmap clickHandler={this.handleRegionChange} region={region} country={country}/>
            </div>

            <div className="evalgraph-container">
              <Evalgraph
                className="graph"
                data={mainGraphData}
                mlMethods={mlMethods}
                humanMethods={humanMethods}
                allMethods={allMethods}
                filter={filter}
                metrics={metrics}
                dateRange={selectedDateRange}
              />
            </div>
          </Row>
          <Row type="flex" justify="space-around">
            <div className="ranking-table-container">
              <RankingTable
                data={rankingTableData}
                addMethod={this.addMethod}
              />
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

export default Evaluation;
