'''
run using '-m' flag from root, i.e.
    python -m scripts.json_scripts.gen_json
'''
import pandas as pd
import os
import json
import collections
from datetime import datetime, date, timedelta
from operator import add
import sys
import math
sys.path.insert(1, 'scripts/json_scripts/')
from . import FORECAST_DIR, GT_DIR, CASE_DIR, FORECAST_TYPES, DAY_ZERO
from . import US_STATE_DEATH_URL, US_STATE_CASE_URL, US_COUNTY_DEATH_URL, US_COUNTY_CASE_URL 
from . import to_date, read_csv, read_truth_csv


def sort_data(data, is_truth=False):
    models = sorted(data.keys(), key=str.casefold)
    sorted_dict = collections.OrderedDict()
    if is_truth:
        days = sorted(data.keys(), key=lambda date: datetime.strptime(date, "%Y-%m-%d")) 
        for day in days:
            sorted_dict[day] = data[day]
    else:
        for model in models:
            sorted_dict[model] = {}
            periods = sorted(data[model].keys())
            for period in periods:
                sorted_dict[model][period] = {}
                days = sorted(data[model][period].keys(), key=lambda date: datetime.strptime(date, "%Y-%m-%d"))
                for day in days:
                    sorted_dict[model][period][day] = data[model][period][day]
    return sorted_dict

def pretty_write(path: str, data: dict, is_truth=False):
    with open(path, 'w') as f:
        if is_truth:
            for day in data.keys():
                data[day] = '{}'.format(data[day])
        else:
            for model in data.keys():
                for period in data[model].keys():
                    for day in data[model][period].keys():
                        data[model][period][day] = '{}'.format(data[model][period][day])
        json.dump(data, f, indent=2)


def write(path: str, data: dict):
    with open(path, 'w') as f:
        json.dump(data, f, separators=(',', ':'))


def get_predictions(path: str, filename: str) -> dict:
    cases = {}
    df = read_csv(path)
    forecast_name = filename.split('.')[0]
    start_ndays = int(forecast_name.split('_')[-1])
    rows = df.axes[1]
    for i, ndays in enumerate(rows):
        pred_period = math.ceil((int(ndays)-start_ndays)/7)
        data = list(df.iloc[:,i])
        #round to 5 decimal places
        data = [math.ceil(dp*10000)/10000 if not isinstance(dp, str) else dp for dp in data]
        # if pred_period > 4:
        #     print(filename, int(ndays))
        if pred_period not in cases:
            cases[pred_period] = {}
        cases[pred_period][ndays] = data
    return cases
# get_predictions('/Users/alex/covid19-forecast-bench/formatted-forecasts/state-death/ensemble_SIkJa_RF/ensemble_SIkJa_RF_172.csv', 'ensemble_SIkJa_RF_172.csv')


#read csvs from formatted-forecast directory
def read_forecast(forecast_path, model: str)-> dict:
    model_cases = {}
    lab_path = os.path.join(forecast_path, model)
    if os.path.isdir(lab_path) is False:
        raise NotADirectoryError(lab_path, 'is not a directory')
    for f in os.listdir(lab_path):
        p = os.path.join(lab_path, f)
        if f.endswith('.csv') is False:
            raise TypeError(p, 'is not a .csv')
        temp = get_predictions(p, f)        
        for period, data in temp.items():
            if period not in model_cases:
                model_cases[period] = {}
            model_cases[period].update(data)
    return model_cases
#read_forecast('/Users/alex/covid19-forecast-bench/formatted-forecasts/state-death', 'ensemble_SIkJa_RF')


# round all date entries into nearest sunday
def condense_dates(data: dict) -> dict:
    temp = {}
    for ndays,vals in data.items():
        nearest_sunday = to_date(ndays)
        if nearest_sunday not in temp:
            temp[nearest_sunday] = vals
        else:
            for i in range(len(vals)):
                if temp[nearest_sunday][i] == 'null':
                    temp[nearest_sunday][i] = vals[i]
                elif vals[i] != 'null':
                    temp[nearest_sunday][i] = str(int(temp[nearest_sunday][i])+int(vals[i])) 
    return temp

#generate ground truth jsons
def gen_ground_truth(url, name=''):
    data = read_truth_csv(url)
    data = sort_data(data, is_truth=True)
    fpath = os.path.join(os.getcwd(), GT_DIR)
    condensed_file = os.path.join(fpath, f'{name}.json')
    pretty_file = os.path.join(fpath, f'{name}_pretty.json')
    write(condensed_file, data)
    pretty_write(pretty_file, data, is_truth=True)


# generate prediction jsons
def gen_predictions():
    convert_dates = True
    path = os.path.join(os.getcwd(), CASE_DIR)
    for forecast in FORECAST_TYPES:
        forecast_path = os.path.join(path, forecast)
        all_cases = {}
        for model in os.listdir(forecast_path):
            if model != '.DS_Store':
                all_cases[model] = read_forecast(forecast_path, model)
        condensed_file = os.path.join(FORECAST_DIR, f'{forecast}.json')
        pretty_file = os.path.join(FORECAST_DIR, f'{forecast}_pretty.json')
        if convert_dates:
            for model in all_cases.keys():
                for period in all_cases[model].keys():
                    temp = {to_date(ndays): val for ndays, val in all_cases[model][period].items()}
                    all_cases[model][period] = temp
        all_cases = sort_data(all_cases)
        write(condensed_file, all_cases)
        pretty_write(pretty_file, all_cases)


def main():
    gen_predictions()
    gen_ground_truth(US_STATE_CASE_URL, name='US_state_case')
    gen_ground_truth(US_STATE_DEATH_URL, name='US_state_death')
    gen_ground_truth(US_COUNTY_CASE_URL, name='US_county_case')
    gen_ground_truth(US_COUNTY_DEATH_URL, name='US_county_death')

if __name__ == '__main__':
    #pass
    main()