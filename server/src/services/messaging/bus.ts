import GPIO, {IGPIOAction, IGPIOState} from "@services/gpio";

export default class MessageBus
{
    public static dispatchGpioAction (action: IGPIOAction): void
    {
        const gpioState: IGPIOState = {
            actionId: action.actionId,
            state: action.action,
            timestamp: action.calledAt,
            caller: action.caller,
        };

        /**
         * If this is a user action, always execute
         */
        if (action.caller === 'user') {
            this.executeState(action.gpioId, gpioState);
            return;
        }

        /**
         * If the state is "new" - aka not yet dispatched - execute it
         */
        if (!GPIO.hasState(action.gpioId, gpioState)) {
            this.executeState(action.gpioId, gpioState);
            return;
        }

        /**
         * The state has been executed before, but may need to be executed again.
         * If the state was _not_ overridden, execute it again.
         */
        if (!GPIO.stateWasOverridden(action.gpioId, gpioState)) {
            this.executeState(action.gpioId, gpioState);
            return;
        }
    }

    protected static executeState (gpioId: string, state: IGPIOState): void
    {
        GPIO.executeState(gpioId, state).then(() => {
            GPIO.pushState(gpioId, state);
        }).catch((error) => {
            console.error(error);
        });
    }
}
