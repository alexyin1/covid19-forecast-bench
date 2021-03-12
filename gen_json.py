import pandas as pd
import os
import json
import collections
from datetime import datetime, date, timedelta

JSON_DIR = 'json-forecasts'
CASE_DIR = 'formatted-forecasts'
FORECAST_TYPES = ['county-case', 'state-case', 'state-death']
DAY_ZERO = datetime(2020, 1, 22) # 2020-1-23 is considered startdate of pand. in U.S.

#turn ndays to actual dates, round to previous sunday
def to_date(ndays):
    delta = timedelta(days=int(ndays))
    date_obj = DAY_ZERO + delta
    one_day = timedelta(days=1)
    while date_obj.weekday() < 6:
        date_obj -= one_day
    return date_obj.strftime("%m-%d-%Y")


def pretty_write(path: str, data: dict, sort_states=False):
    with open(path, 'w') as f:
        sorted_dict = collections.OrderedDict()
        models = sorted(data.keys(), key=str.casefold)
        for model in models:
            sorted_dict[model] = {}
            days = sorted(data[model].keys(), key=str.casefold)
            for day in days:
                if sort_states:
                    data[model][day] = [-1 if str(val)=='null' else val for val in data[model][day]]
                    cases = '{}'.format(sorted(data[model][day]))
                    sorted_dict[model][day] = cases
                else:
                    sorted_dict[model][day] = '{}'.format(data[model][day])
        json.dump(sorted_dict, f, indent=2)


def write(path: str, data: dict):
    with open(path, 'w') as f:
        json.dump(data, f, separators=(',', ':'))


#read csvs from formatted-forecast directory
def read_forecast(forecast_path, model_name: str)-> dict:
    model_cases = {}
    lab_path = os.path.join(forecast_path, model_name)
    if os.path.isdir(lab_path) is False:
        raise NotADirectoryError(lab_path, 'is not a directory')
    for file in os.listdir(lab_path):
        p = os.path.join(lab_path, file)
        if file.endswith('.csv') is False:
            raise TypeError(p, 'is not a .csv')
        model_cases.update(read_single_csv(p))
    return model_cases


def read_single_csv(path: str) -> dict:
    df = pd.read_csv(path, index_col=0)
    df.fillna(value='null', inplace=True)
    cases = {}
    for i, row in enumerate(df.iterrows()):
        case_data = row[1]
        for label in case_data.index:
            if label != 'State' and label != 'County':
                if label in cases:
                    cases[label].append(case_data[label])
                else:
                    cases[label] = []
    return cases


def main():
    convert_dates = True
    path = os.path.join(os.getcwd(), CASE_DIR)
    for forecast in FORECAST_TYPES:
        forecast_path = os.path.join(path, forecast)
        all_cases = {}
        for model_name in os.listdir(forecast_path):
            all_cases[model_name] = {}
            all_cases[model_name].update(read_forecast(forecast_path, model_name))
        condensed_file = os.path.join(JSON_DIR, f'{forecast}.json')
        pretty_file = os.path.join(JSON_DIR, f'{forecast}-pretty.json')
        if convert_dates:
            for model in all_cases.keys():
                temp = {to_date(ndays): val for ndays, val in all_cases[model].items()}
                all_cases[model] = temp
        write(condensed_file, all_cases)
        pretty_write(pretty_file, all_cases)


if __name__ == '__main__':
    # with open('json-forecasts/state-case.json') as f:
    #     all_dates = set()
    #     data = json.load(f)
    main()