import { v4 as uuidv4 } from 'uuid';
import StackTrace from 'stacktrace-js';
import os from 'node:os';

export interface IPayload {
    type: string;
    content: Record<string, any>;
    origin: {
        function_name: string,
        file: string,
        line_number: number,
        hostname: string,
    }
}

const LIB_STACK_SOURCES = () => [...(process.env.ALEKSRAY_LIB_STACK_SOURCES?.split(';') || []), '@alekswilc/ray', '@alekswilc\\ray', 'standalone-aleksray-bundle.js', 'standalone-aleksray-bundle.mjs', 'aleksray.js', 'aleksray.mjs']

export class Payload {
    public static create(data: Omit<IPayload, 'origin'> & Partial<IPayload>) {
        if (!data.origin) {
            const or = StackTrace.getSync().filter(x => !LIB_STACK_SOURCES().some(y => x.getSource().includes(y)))[0];

            data.origin = {
                function_name: or.getFunctionName(),
                file: or.getFileName().replace('file:///', ''),
                line_number: or.getLineNumber(),
                hostname: os.hostname(),
            }
        }

        return new Payload(<IPayload>data);
    }

    public constructor(private data: IPayload) {
        
    }


    toJSON() {
        return this.data;
    }
}

Payload.create({ type: 'test', content: {} });

export interface IRequest {
    uuid: string;
    payloads: IPayload[]
    meta: Record<string, string>
}

export class Request {
    public static create(data: Omit<IRequest, 'meta' | 'uuid'> & Partial<IRequest>) {
        if (!data.meta) {
            data.meta = {
                aleks_ray_version: '1.0.0',
            }
        }

        if (!data.uuid) data.uuid = uuidv4();

        return new Request(<IRequest>data);
    }

    public constructor(private data: IRequest) {}

    get uuid() {
        return this.data.uuid;
    }

    toJSON() {
        return this.data;
    }
}