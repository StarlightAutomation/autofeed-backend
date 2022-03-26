import json
import os

BCM='BCM'
OUT='OUT'

pin_json_path = os.path.dirname(os.path.realpath(__file__)) + "/pins.json"
pin_json = json.load(open(pin_json_path))

def setwarnings (value) -> None:
    return

def setmode (mode) -> None:
    return

def setup (pin, setting) -> None:
    return

def output (pin, setting) -> None:
    pin_json[str(pin)] = int(setting)
    json.dump(pin_json, open(pin_json_path, "w"))
    return

def input (pin):
    return pin_json[str(pin)]