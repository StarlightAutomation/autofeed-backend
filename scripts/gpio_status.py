import RPi.GPIO as GPIO

import sys

args=sys.argv

if len(args) < 2:
    raise Exception('Invalid arguments list')

pin=args[1]

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

GPIO.setup(int(pin), GPIO.OUT)
status=GPIO.input(int(pin))

print("status=%s" % status)
exit(0)
