if (!global.fetch) {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        if (e instanceof Error && e.message.includes('Cannot find module')) {
            throw new Error('@alekswilc/ray -> Please install node-fetch (npm i node-fetch@2) for compatibility')
        }
    }
}


export { ray, Ray, IOptions } from './Ray';
export { Request, Payload, IRequest, IPayload } from './Payload';