from tkinter import filedialog, Tk
import pandas as pd
import eel
import json


# Default allowed_extensions are: ['.js', '.html', '.txt', '.htm', '.xhtml']
eel.init('web', allowed_extensions=['.js', '.html'])


@eel.expose
def get_data():
    """Open file selector and convert csv to json"""
    root = Tk()
    root.withdraw()
    root.wm_attributes('-topmost', 1)
    folder = filedialog.askopenfile()
    data = pd.read_csv(folder)
    data_json = json.loads(data.to_json(orient='records'))
    return data_json

@eel.expose
def load_data():
    """Open file selector and get file paths and cols"""
    root = Tk()
    root.withdraw()
    root.wm_attributes('-topmost', 1)
    folder = filedialog.askopenfile()
    data = list(pd.read_csv(folder).columns.values)
    return  (data, folder.name)

@eel.expose
def load_merge(file1, file2, cols1, cols2, pk):
    """Load and merge files from html paths"""
    if len(file2) == 0:
        data = pd.read_csv(file1, usecols=cols1)
    elif len(file2) != 0:
        data1 = pd.read_csv(file1, usecols=cols1)
        data2 = pd.read_csv(file2, usecols=cols2)
        data = pd.merge(data1, data2, on=pk, how="inner", suffixes=("_current", "_benchmark"))
    data_json = json.loads(data.to_json(orient='records'))
    return  data_json

eel.start('main.html', block=False)

while True:
    eel.sleep(10)
