import {GPIO_CALLER, GPIO_STATE, IGPIOAction, IGPIOState} from "@services/gpio";
import MessageBus from "@services/messaging/bus";
const md5 = require("md5");

export default class Message
{
    protected gpioAction: IGPIOAction;

    protected constructor (gpioId: string, action: GPIO_STATE, caller: GPIO_CALLER, calledAt: Date, payload?: any)
    {
        const data: any = {
            gpioId,
            action,
            caller,
            payload,
        };

        data.actionId = md5(JSON.stringify(data));
        this.gpioAction = { ...data, calledAt };
    }

    public get action (): IGPIOAction
    {
        return this.gpioAction;
    }

    public get state (): IGPIOState
    {
        return {
            gpioId: this.gpioAction.gpioId,
            actionId: this.gpioAction.actionId,
            state: this.gpioAction.action,
            timestamp: this.gpioAction.calledAt,
            caller: this.gpioAction.caller,
        };
    }

    public dispatchGpioAction (): void
    {
        MessageBus.dispatchGpioAction(this.action);
    }

    public static generate (gpioId: string, action: GPIO_STATE, caller: GPIO_CALLER, payload?: any): Message
    {
        return new Message(gpioId, action, caller, new Date(), payload);
    }

    public static dispatchScheduledAction (gpioId: string, action: GPIO_STATE, payload?: any): void
    {
        const message = new Message(gpioId, action, 'schedule', new Date(), payload);
        MessageBus.dispatchGpioAction(message.action);
    }

    public static dispatchSystemAction (gpioId: string, action: GPIO_STATE, payload?: any): void
    {
        const message = new Message(gpioId, action, 'system', new Date(), payload);
        MessageBus.dispatchGpioAction(message.action);
    }

    public static dispatchUserAction (gpioId, action: GPIO_STATE, payload?: any): void
    {
        const message = new Message(gpioId, action, 'user', new Date(), payload);
        MessageBus.dispatchGpioAction(message.action);
    }
}
