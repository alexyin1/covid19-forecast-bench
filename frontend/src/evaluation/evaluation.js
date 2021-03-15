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
const US_STATES = [
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
];

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
    };
  }

  componentDidMount() {
    ReactGA.initialize("UA-186385643-2");
    ReactGA.pageview("/covid19-forecast-bench/evaluation");

    var data = this.parseJsonUrl();
    setTimeout(() => {this.initialize(data);}, 500);
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
  }

  componentWillMount = () => {
    this.formRef = React.createRef();
  };

  parseJsonUrl = () => {
    var url = "https://raw.githubusercontent.com/alexyin1/covid19-forecast-bench/master/json-forecasts/state-death.json";
    var dataDict = {};
    fetch(url).then(response => response.json()).then((jsonResult) => {
        Object.keys(jsonResult).forEach(function(key) {
          dataDict[key] = jsonResult[key];
          //console.log(dataDict[key]);
        });
      }).catch((error) => {
      console.error(error)
    });
    this.setState((state) => {
      return {jsonData: dataDict};
    })
    //console.log(this.state.jsonData);
    //console.log("finished");
    return dataDict;
  }

  initialize = (jsonData) => {
    //console.log(jsonData);
    var methodList = this.state.methodList;

    Object.keys(jsonData).forEach(function(method) {
      methodList = methodList.concat(method);
    });
    //console.log(method, jsonData[method]);
    this.setState((state) => {
      return {methodList: methodList};
    });

    //console.log(this.state.methodList);
    this.updateData(jsonData);
    this.setState({
      selectedDateRange: this.state.maxDateRange
    }, ()=> {
      this.formRef.current.setFieldsValue({
        dateRange: [0, this.getTotalNumberOfWeeks()]
      });
    });
    this.addMethod("reich_COVIDhub_ensemble");
    this.addMethod("ensemble_SIkJa_RF");
  };

  updateData = jsonData => {
    let maxDateRange = [undefined, undefined];
    let anchorDatapoints = { maeData: [] };
    let oldMaxRange = this.state.maxDateRange;

    Object.keys(jsonData).forEach(function(method) {
      for (var date in jsonData[method]) {
        var curr_date = new Date(date);
        if (jsonData[method][date]) {
          if (!maxDateRange[0]) { maxDateRange[0] = date; }
          if (!maxDateRange[1]) { maxDateRange[1] = date; }

          var min_date = new Date(maxDateRange[0]);
          var max_date = new Date(maxDateRange[1]);
          if (curr_date < min_date) {
            maxDateRange[0] = date;
          }
          if (curr_date > max_date) {
            maxDateRange[1] = date;
          }
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

      this.setState((state) => {
          return {mainGraphData: { anchorDatapoints },
                  maxDateRange: maxDateRange};
        });
    }
    this.reloadAll();
    setTimeout(() => {this.generateRanking();}, 500);
    //this.generateRanking();
    //console.log(this.state.mainGraphData);
  };
  // goes through each method and grabs the data relative the parameters set
  graphData = method => {
    var reg_num = US_STATES.findIndex(obj => obj === this.state.region);
    var localFilter;
    var graph_data = [];
    localFilter = this.isMLMethod(method) ? "ml":"human";

    let baselineAverageMAE = this.state.jsonData["reich_COVIDhub_baseline"];
    var methodData = [];
    
    for (var date in this.state.jsonData[method]) {
      methodData.push({"x": date, "y": this.state.jsonData[method][date]});
    }
    methodData.sort((a, b) => new Date(a.x) - new Date(b.x));

    // let relativeMAE_Sum = 0;

    if (localFilter == this.state.filter || this.state.filter == "all") {
      for (var element in methodData) {
        // TODO: multiple regions
        var date = methodData[element].x;
        var points = methodData[element].y;
        if (baselineAverageMAE[date]) {
          var curr_date = new Date(date);
          var min_date = new Date(this.state.selectedDateRange[0]);
          var max_date = new Date(this.state.selectedDateRange[1]);
          if (curr_date >= min_date && curr_date <= max_date) {
            var raw_y;
            var MAE_y;
            if (reg_num == -1) {
              let sum = 0;
              let baseline_sum = 0;
              for (var reg in points) {
                if (points[reg] != "null") {
                  sum += parseInt(points[reg]);
                  baseline_sum += parseInt(baselineAverageMAE[date][reg]);
                }
              }

              raw_y = (sum == 0) ? "null" : sum;
              MAE_y = (baseline_sum == 0) ? "null" : baseline_sum;
            }
            else {
              raw_y = parseInt(points[reg_num]);
              MAE_y = parseInt(baselineAverageMAE[date][reg_num])
            }

            if (raw_y != "null" &&  MAE_y != 'null') {
              //relativeMAE_Sum += raw_y/ MAE_y;
              graph_data.push({x: date, y: Math.abs(raw_y-MAE_y),});
            }
          }
        }
      }
    }
    return graph_data;
  };

  generateRanking = () => {
    var reg_num = US_STATES.findIndex(obj => obj === this.state.region);

    let baselineAverageMAE = this.state.jsonData["reich_COVIDhub_baseline"];
    let methodList = this.state.methodList;
    var relativeMAE;

    var rankingTableData = [];
    let cutOff = 0;
   
    for (var method in methodList) {
      var methodName = methodList[method];
      var localFilter = this.isMLMethod(methodName) ? "ml" :"human";
      var methodType = this.isMLMethod(methodName) ? "ML/AI" : "Human-Expert";
      var methodData = [];

      console.log(methodName);
      console.log(this.state.jsonData[methodName]);
    
      for (var date in this.state.jsonData[methodName]) {
        methodData.push({"x": date, "y": this.state.jsonData[methodName][date]});
      }
      methodData.sort((a, b) => new Date(a.x) - new Date(b.x));

      //console.log(methodData);

      let forecastCount = 0;
      let MAE_Sum = 0;
      let relativeMAE_Sum = 0;
      let fromSelectedStartDate = false;
      let upToSelectedEndDate = false;
      let updating = false;

      //console.log(methodName);

      if (localFilter == this.state.filter || this.state.filter == "all") {
        for (var element in methodData) {
          // TODO: multiple regions
          var date = methodData[element].x;
          var points = methodData[element].y;
          //console.log(date);
          //console.log(points);

          if (baselineAverageMAE[date]) {
            var curr_date = new Date(date);
            var min_date = new Date(this.state.selectedDateRange[0]);
            var max_date = new Date(this.state.selectedDateRange[1]);
            if (curr_date >= min_date && curr_date <= max_date) {
              var raw_y;
              var MAE_y;
              if (reg_num == -1) {
                let sum = 0;
                let baseline_sum = 0;
      
                for (var reg in points) {
                  if (points[reg] != "null") {
                    sum += parseInt(points[reg]);
                    baseline_sum += parseInt(baselineAverageMAE[date][reg]);
    
                  }
                }
    
                raw_y = (sum == 0) ? "null" : sum;
                MAE_y = (baseline_sum == 0) ? "null" : baseline_sum;
              }
              else {
                raw_y = parseInt(points[reg_num]);
                MAE_y = parseInt(baselineAverageMAE[date][reg_num])
                
              }
    
              if (raw_y != "null" &&  MAE_y != "null") {
                MAE_Sum += raw_y;
                relativeMAE_Sum += raw_y/ MAE_y;
                forecastCount++;
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
          }
        }
        if( forecastCount != 0){
          const fitWithinDateRange = fromSelectedStartDate && upToSelectedEndDate;
          const averageMAE = (MAE_Sum / forecastCount).toFixed(2);
          relativeMAE = (relativeMAE_Sum / forecastCount);
          if (methodName === "reich_COVIDhub_baseline") {
            relativeMAE = 1;
          }
          relativeMAE = relativeMAE.toFixed(3);
  
          if (forecastCount && (cutOff == forecastCount)) {
            rankingTableData[method] = {methodName, methodType, averageMAE, relativeMAE, forecastCount, fitWithinDateRange, updating};
          }
        }
      }
    }

    this.setState({rankingTableData: rankingTableData});
  };
  

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
      }
    );

    //console.log(this.state.mainGraphData);
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
      }
    );
  };

  handleForecastTypeSelect = type => {
    this.setState({
      forecastType: type
    });
    this.updateData(this.state.jsonData);
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
    this.updateData(this.state.jsonData);
  };

  handleRegionChange = newRegion => {
  this.setState(
    {
      region: newRegion,
    });

    this.updateData(this.state.jsonData);

    this.formRef.current.setFieldsValue({
      region: this.state.region,
    });
  };

  handleFilterChange = e => {
    this.setState({
      filter: e.target.value,
    });

    this.updateData(this.state.jsonData);
  };

  getTotalNumberOfWeeks = () => {
    const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;
    const start = new Date(this.state.maxDateRange[0]);
    const end = new Date(this.state.maxDateRange[1]);
    var result = (end.getTime() - start.getTime()) / MS_PER_WEEK;
    //console.log("END:" + end);
    //console.log("START:" + start);
    //console.log("PROC:" + (end.getTime()-start.getTime()));
    //console.log("MS_PER_WEEK:" + MS_PER_WEEK);
    //console.log("RES:" + result);
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
    this.updateData(this.state.jsonData);
  }

  render() {
    const {
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
        US Average
      </Option>
    );
    US_STATES.forEach((state, index) => {
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
                      defaultValue="states"
                      value={region}
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
              <Evalmap clickHandler={this.handleRegionChange} region={region}/>
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
