# Benchmarking Forecasting Methodologies
 The existing comparisons during COVID-19 are those of forecasts (forecasting teams) rather than forecasting methodologies. Instead of "who did well", we are interested in "what worked well" over the duration of the pandemic.

 The goal of this work is to compare various methodologies and create a benchmark against which new methodologies can be evaluated. When designing a new methodology, bringing the entire evaluation to one error number is not enough. One has to assess the performance over time, and the difficulty of forecasting is likely to be different over the period. The benchmark, as the performances of collection of methodologies over time, can guide in a better assessment.
 This work will also identify various decisions that affect the accuracy of forecasts from the submit methodologies. These "decisions" may include:
 - Modeling technique: Generative (SIR, SEIR, ...), Discriminative (Neural Networks, ARIMA, ...), ...
 - Learning approach: Bayesian, Regression (Quadratic Programming, Gradient Descent, ...), ... 
 - Pre-processing: Smoothing (1 week, 2, week, auto), anomaly detection, ...

 ## Data for evaluation
 We use the latest JHU data as the ground truth derived from the history of timeseries data (https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_time_series).
 Note that this in not to be used for training. Forecasts on a past date must use the data that was available that day for training. The versions of JHU data available on various days of the past are available as timeseries in: https://github.com/scc-usc/ReCOVER-COVID-19/blob/master/results/historical_forecasts

 ## List of methods already included
 - YYG-ParamSearch: https://github.com/youyanggu/covid19_projections
 - UMich-RidgeTfReg: https://gitlab.com/sabcorse/covid-19-collaboration
 - Karlen-pypm: https://pypm.github.io/home/
 - Variations of USC-SIkJa: https://github.com/scc-usc/ReCOVER-COVID-19

 The other files are derived from Reich Lab's forecast hub: https://github.com/reichlab/covid19-forecast-hub/tree/master/data-processed
 These will be replaced by submitted files that represent consistent methodology.

 ## Submitting your forecasts
 We invite the interested teams to submit forecasts generated by their methodology by issuing a pull request. 
 - While generating retrospective forecasts, please ensure that you are only using data that was available before then. 
 - You may use the historical versions of the JHU data available at the following repo in timeseries format: https://github.com/scc-usc/ReCOVER-COVID-19/blob/master/results/historical_forecasts
 - The format of the file should be exactly like the submissions for Reich Lab's forecast hub. Please follow the same naming convention as well: **{Date of forecast (YYYY-MM-DD)}-{Method_Name}.csv**.
 - Please add your files in the folder "raw-forecasts/". We welcome case as well as death forecasts for the US states. If there is sufficient interest, we will expand this to forecasts for countries as well.
 - The forecasts are expected to be incident cases forecasts per week. We do not compute the errors for a week when the forecast was performed on a day after Monday of the same week. This is in accordance with the Reich Lab's forecasting hub.
 - Please note that any change in your approach, including data pre-processing and hand-tuning a parameter counts as a different methodology. You can alter your method name to mark the distinction such as by appending an appropriate suffix.
 - In a file named **metadata-{Method Name}.csv**, please provide a short description of your approach, mentioning at least the following:
   - Modeling technique: Generative (SIR, SEIR, ...), Discriminative (Neural Networks, ARIMA, ...), ...
   - Learning approach: Bayesian, Regression (Quadratic Programming, Gradient Descent, ...), ... 
   - Pre-processing: Smoothing (1 week, 2, week, auto), anomaly detection, ...
 - If you are submitting forecasts for multiple methodolgies, please ensure there is something in their metadata descriptions that differentiates them.
 - If possible, each methodology should submit at least two forecasts per week (on two separate days of the week). Higher frequency (up to once a day) is also welcome. We will take the retrospective forecasts for any range of time, starting in May until the present.

 We are grateful for your support and look forward to your contributions!

 ## Contact
 Ajitesh Srivastava (ajiteshs[AT]usc[DOT]]edu)