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
from . import to_date, read_csv, ymd_to_mdy, US_DEATH_URL
from .gen_json import read_forecast, read_truth_csv

FORECASE_TYPE = 'formatted-forecasts/state-death'
BASELINE_FORECAST = 'reich_COVIDhub_baseline'
DEFAULT_FORECAST = 'ensemble_SIkJa_RF'
DEFAULT_JSON = 'json-forecasts/state-death.json'


def get_MAE(data):
    temp = 0
    for val in data.values():
        temp += sum(val)
    return temp

def validate_MAE(baseline, csv):
    for i in range(1, 5, 1):
        mae_sum = 0
        count = 0
        shared_dates = list(set(baseline[i]) & set(csv[i]))
        for date in shared_dates:
            print(to_date(date), end=' ')
        # for date in shared_dates:
        #     base_sum = sum(baseline[i][date])
        #     csv_sum = sum(csv[i][date])
        #     mae_sum += abs(base_sum - csv_sum)
        # n_days = len(shared_dates)
        # mae_sum /= n_days
        # mae_sum /= 50
        # print(mae)
    return True

def main():
    baseline_data = {}
    csv_data = {}
    json_data = {}
    ground_truth_data = {}
    # baseline_data[BASELINE_FORECAST] = read_forecast(FORECASE_TYPE, BASELINE_FORECAST)
    # csv_data[DEFAULT_FORECAST] = read_forecast(FORECASE_TYPE, DEFAULT_FORECAST)
    ground_truth_data = read_truth_csv(US_DEATH_URL)
    # print(ground_truth_data)
    # with open(DEFAULT_JSON) as f:
    #     json_data.update(json.load(f))
    # validate_MAE(baseline_data[BASELINE_FORECAST], csv_data[DEFAULT_FORECAST])

if __name__ == '__main__':
    main()

