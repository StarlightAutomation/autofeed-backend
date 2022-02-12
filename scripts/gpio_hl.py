import RPi.GPIO as GPIO
import sys

args=sys.argv

if len(args) < 3:
    raise Exception('Invalid arguments list')

pin=args[1]
setting=args[2]

if setting == "1":
    setting = True
    settingName = "HIGH"
else:
    setting = False
    settingName = "LOW"

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(int(pin), GPIO.OUT)

GPIO.output(int(pin), setting)
print('Pin %s set to %s' % (pin, settingName))
exit(0)
