import {GPIO_CALLER, GPIO_STATE, IGPIOAction} from "@services/gpio";
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
