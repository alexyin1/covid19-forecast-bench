'''
run using '-m' flag from root, i.e.
    python -m scripts.json_scripts.validate_json
'''
import pandas as pd
import os
import json
import collections
from datetime import datetime, date, timedelta
from operator import add
import sys
import requests
import math

sys.path.insert(1, 'scripts/json_scripts/')
from . import JSON_DIR, CASE_DIR, FORECAST_TYPES, DAY_ZERO
from . import to_date, read_csv
from .gen_json import read_forecast, read_truth_csv

FORECASE_TYPE = 'formatted-forecasts/state-death'
BASELINE_FORECAST = 'reich_COVIDhub_baseline'
DEFAULT_FORECAST = 'ensemble_SIkJa_RF'
DEFAULT_JSON = 'json-data/state-death.json'
US_DEATH_GT = 'json-data/US_death_gt.json'

def get_MAE(data):
    temp = 0
    for val in data.values():
        temp += sum(val)
    return temp

def validate_MAE(old_csv, gt):
    csv = {}
    for i in old_csv.keys():
        csv[i] = {to_date(ndays): val for ndays, val in old_csv[i].items()}
    US_avg_mean = 0
    for i in range(1, 5, 1):
        shared_dates = list(set(csv[i]) & set(gt))
        # skip mae regions
        mean_mae_over_dates = 0
        for date in shared_dates:
            print('n_forecasts', min(len(gt), len(csv[i][date])))
            # print('PRED', csv[i][date])
            # print('GT', gt[date])
            sum_of_states_mae = 0
            count = 0
            for reg in range(min(len(gt), len(csv[i][date]))):
                sum_of_states_mae += abs(csv[i][date][reg] - gt[date][reg])
                count += 1
            mean_mae_over_dates += sum_of_states_mae / count
        US_avg_mean += mean_mae_over_dates / len(shared_dates)
    print(US_avg_mean/4)
    return True

def main():
    baseline_data = {}
    csv_data = {}
    json_data = {}
    ground_truth_data = {}
    # baseline_data[BASELINE_FORECAST] = read_forecast(FORECASE_TYPE, BASELINE_FORECAST)
    csv_data[DEFAULT_FORECAST] = read_forecast(FORECASE_TYPE, DEFAULT_FORECAST)
    ground_truth_data = {}
    with open(US_DEATH_GT) as f:
        ground_truth_data.update(json.load(f))
    # print(ground_truth_data)
    # with open(DEFAULT_JSON) as f:
    #     json_data.update(json.load(f))
    #print(csv_data[DEFAULT_FORECAST])
    validate_MAE(csv_data[DEFAULT_FORECAST], ground_truth_data)

if __name__ == '__main__':
    main()

