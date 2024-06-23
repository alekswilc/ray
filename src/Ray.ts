import { Queue } from 'Queue.js';
import { ArgumentConverter } from './argConverter';
import { IPayload, Payload, Request } from './Payload';
import { v4 as uuidv4 } from 'uuid';

let defaultRayOptions: IOptions = {
    uri: () => process.env.ALEKSRAY_URI || 'http://localhost:23517/',
    enabled: () => !process.env.ALEKSRAY_DISABLED,

}

export interface IOptions {
    uri: () => string;
    enabled: () => boolean
}

export class Ray {
    public uuid: string | undefined = undefined;
    protected origin?: IPayload['origin'];

    public color(name: string): Ray {
        if (!defaultRayOptions.enabled()) return this;
        const payload = Payload.create({
            type: 'color',
            content: {
                color: name
            }
        });
        return this.sendRequest(Request.create({ payloads: [payload.toJSON()], uuid: this.uuid }));
    }

    public customOrigin(origin: IPayload['origin']) {
        this.origin = origin;
        return this;
    }

    public label(data: string): Ray {
        if (!defaultRayOptions.enabled()) return this;

        const payload = Payload.create({
            type: 'label',
            content: {
                label: data
            },
            origin: this.origin
        });

        return this.sendRequest(Request.create({ payloads: [payload.toJSON()], uuid: this.uuid }));
    }

    public separator() {
        if (!defaultRayOptions.enabled()) return this;

        const payload = Payload.create({
            type: 'separator',
            content: {},
            origin: this.origin
        });

        return this.sendRequest(Request.create({ payloads: [payload.toJSON()], uuid: this.uuid }));
    }

    public log(data: any) {
        return this.send(data).green();
    }

    public info(data: any) {
        return this.send(data).green();
    }

    public debug(data: any) {
        return this.send(data).gray();
    }

    public warn(data: any) {
        return this.send(data).orange();
    }

    public error(data: any | Error) {
        if (data instanceof Error) return this.send(data.stack).red();

        return this.send(data).red();
    }

    public raw(arg: any) {
        if (!defaultRayOptions.enabled()) return this;

        const payload = Payload.create({
            type: 'log',
            content: {
                values: [arg],
            },
            origin: this.origin
        });

        return this.sendRequest(Request.create({ payloads: [payload.toJSON()], uuid: this.uuid }));
    }

    public json(arg: any) {
        if (!defaultRayOptions.enabled()) return this;

        const payload = Payload.create({
            type: 'json_string',
            content: {
                value: JSON.stringify(arg),
            },
            origin: this.origin
        });

        return this.sendRequest(Request.create({ payloads: [payload.toJSON()], uuid: this.uuid }));
    }

    public pretty(arg: any) {
        const a = ArgumentConverter.convertToPrimitive(arg);
        if (a.isHtml) {
            const payload = Payload.create({
                type: 'custom',
                content: {
                    content: a.value,
                    label: 'HTML'
                },
                origin: this.origin
                
            });
            return this.sendRequest(Request.create({ payloads: [payload.toJSON()], uuid: this.uuid }));
        }

        const payload = Payload.create({
            type: 'log',
            content: {
                values: [ArgumentConverter.convertToPrimitive(arg).value],
            },
            origin: this.origin
        });

        return this.sendRequest(Request.create({ payloads: [payload.toJSON()], uuid: this.uuid }));
    }

    public send(arg: any): Ray {
        if (!defaultRayOptions.enabled()) return this;


        const isObject = ['object', 'boolean', 'function', 'symbol', 'undefined'].includes(typeof arg);
        if (isObject) return this.json(arg);


        const payload = Payload.create({
            type: 'log',
            content: {
                values: [arg],
            },
            origin: this.origin
        });

        return this.sendRequest(Request.create({ payloads: [payload.toJSON()], uuid: this.uuid }));

    }

    public green(): Ray {
        return this.color('green');
    }

    public orange(): Ray {
        return this.color('orange');
    }

    public red(): Ray {
        return this.color('red');
    }

    public purple(): Ray {
        return this.color('purple');
    }

    public blue(): Ray {
        return this.color('blue');
    }

    public gray(): Ray {
        return this.color('gray');
    }

    public async pause() {
        if (!defaultRayOptions.enabled()) return this;

        const lockName = uuidv4();

        const payload = Payload.create({
            type: 'create_lock',
            content: {
                name: lockName
            },
            origin: this.origin
        });
        await this.sendRequestAsync(Request.create({ payloads: [payload.toJSON()], uuid: this.uuid }));


        const isLockActive = async () => {
            const data = await fetch(defaultRayOptions.uri() + `locks/${lockName}`).then(x => x.json()).catch(() => false);

            if (!data) return { active: true };

            if (data.stop_execution) process.exit(1);

            return data;
        }

        do {
            await new Promise(res => setTimeout(res, 500))
        } while ((await isLockActive()).active)

    }


    public sendRequest(request: Request): Ray {
        if (!defaultRayOptions.enabled()) return this;

        this.uuid = request.uuid;

        Queue.add(() => fetch(defaultRayOptions.uri(), {
            method: 'POST',
            body: JSON.stringify(request.toJSON(), (_, v) => typeof v === 'bigint' ? v.toString() : v),
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(() => { }));

        return this;
    }

    public sendRequestAsync(request: Request) {
        if (!defaultRayOptions.enabled()) return this;

        this.uuid = request.uuid;

        return Queue.add(() => fetch(defaultRayOptions.uri(), {
            method: 'POST',
            body: JSON.stringify(request.toJSON(), (_, v) => typeof v === 'bigint' ? v.toString() : v),
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(() => { }));
    }

}

export const ray = (arg?: any) => 
    arg ? (new Ray()).send(arg) : new Ray();



export default Ray;