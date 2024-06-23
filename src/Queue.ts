export interface IQueueItem { 
    res: (value: any) => void
    rej: (reason?: any) => void
    promise: (...args: any[]) => PromiseLike<any> 
}

export class Queue {
    private static queue: IQueueItem[] = [];
    private static isPending = false;

    public static add(promise: (...args: any[]) => PromiseLike<any>) {
        return new Promise((res, rej) => {
            this.queue.push({
                res, rej, promise
            });
            this.process();
        });
    }

    private static process() {
        if (this.isPending) return false;
        const item = this.queue.shift();
        if (!item) return false;
        this.isPending = true;
        item?.promise()
            .then(val => this.done(item, val, item.res))
    }

    private static done(item: IQueueItem, val: any, func: (val: any) => any) {
        this.isPending = false;
        func(val);
        this.process();
    }
}