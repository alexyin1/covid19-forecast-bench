from datetime import datetime
import pandas as pd
import sys
from datetime import datetime, date, timedelta

IGNORED_FF_COLS = ['State', 'County', 'Country'] # counties to be ignored from formatted forecasts
JSON_DIR = 'json-data'
CASE_DIR = 'formatted-forecasts'
FORECAST_TYPES = ['county-case', 'state-case', 'state-death']
DAY_ZERO = datetime(2020, 1, 22) # 2020-1-23 is considered startdate of pand. in U.S.
US_DEATH_URL = "https://raw.githubusercontent.com/scc-usc/ReCOVER-COVID-19/master/results/forecasts/us_deaths.csv"


#turn ndays to actual dates
def to_date(ndays, round_to_sunday=False):
    delta = timedelta(days=int(ndays))
    date_obj = DAY_ZERO + delta
    if round_to_sunday:
        one_day = timedelta(days=1)
        while date_obj.weekday() < 6:
            date_obj -= one_day
    return date_obj.strftime("%Y-%m-%d")

def ymd_to_mdy(ymd):
    date_obj = datetime.strptime(ymd, '%Y-%m-%d')
    return date_obj.strftime("%m-%d-%Y")

def read_csv(path) -> dict:
    cols = list(pd.read_csv(path, index_col=0, nrows=1))
    # skip the smallest ndays in formatted forecast, because that is a sum value
    min_key = sys.maxsize
    for key in cols:
        min_key = int(key) if key.isnumeric() and int(key) < min_key else min_key 
    wanted_cols = [i for i in cols if i not in IGNORED_FF_COLS and i != min_key]
    # only read wanted cols
    df= pd.read_csv(path, index_col=0, usecols=wanted_cols)
    df.fillna(value='null', inplace=True)
    return df


def read_truth_csv(url):
    df = read_csv(url)
    cases = {}
    rows = df.axes[1]
    for i, row in enumerate(rows):
        cases[row] = list(df.iloc[:,i])
    return cases    