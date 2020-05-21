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

eel.start('main.html', block=False)

while True:
    eel.sleep(10)
