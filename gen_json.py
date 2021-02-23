import pandas as pd
import os
import json
import collections

JSON_DIR = 'json-forecasts'
CASE_DIR = 'formatted-forecasts'
FORECAST_TYPES = ['county-case', 'state-case', 'state-death']

def pretty_write(path: str, data: dict):
    with open(path, 'w') as f:
        sorted_dict = collections.OrderedDict()
        models = sorted(data.keys(), key=str.casefold)
        for model in models:
            sorted_dict[model] = {}
            days = sorted(data[model].keys(), key=str.casefold)
            for day in days:
                cases = '{}'.format(sorted(data[model][day]))
                sorted_dict[model][day] = cases    
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
    cases = {}
    for i, row in enumerate(df.iterrows()):
        case_data = row[1]
        for label in case_data.index:
            if label != 'State':
                if label in cases:
                    cases[label].append(case_data[label])
                else:
                    cases[label] = []
    return cases


def main():
    path = os.path.join(os.getcwd(), CASE_DIR)
    for forecast in FORECAST_TYPES:
        forecast_path = os.path.join(path, forecast)
        all_cases = {}
        for model_name in os.listdir(forecast_path):
            all_cases[model_name] = {}
            all_cases[model_name].update(read_forecast(forecast_path, model_name))
        condensed_file = os.path.join(JSON_DIR, f'{forecast}.json')
        pretty_file = os.path.join(JSON_DIR, f'{forecast}-pretty.json')
        write(condensed_file, all_cases)
        pretty_write(pretty_file, all_cases)


if __name__ == '__main__':
    main()