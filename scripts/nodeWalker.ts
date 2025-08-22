
type ScalarValue = 'bigint' | 'string' | 'number' | 'boolean' | null | undefined;
type ScalarValueArray = ScalarValue[];
interface JSObject {
    [key: string]: GeneralValue;
}
type GeneralValue = ScalarValue | ScalarValueArray | JSObject | JSObject[];

function isScalar(u: any): u is ScalarValue {
    const tt = typeof u;
    return ['bigint', 'string', 'number', 'boolean', 'undefined'].includes(tt) || u === null;
}

function isArray(u: any): u is (ScalarValueArray | JSObject[]) {
    return u !== null && u !== undefined && Array.isArray(u) && u.length > 0;
}

export function recursiveDescend(startNode: GeneralValue, selector: (node: GeneralValue) => GeneralValue | undefined, collector: GeneralValue[] = []) {
    // special treatment if it is an array
    if (Array.isArray(startNode) && startNode.length > 0) {
        for (const node of startNode) {
            recursiveDescend(node, selector, collector);
        }
        return collector;
    }
    // it is an object we are interested in?
    if (selector(startNode)) {
        if (collector.indexOf(startNode) === -1) {
            collector.push(startNode);
        }
        else {
            return collector; // terminate, avoid endless looping because of circular reference
        }
    }
    // recursiveDescend if possible
    if (!isScalar(startNode)) {
        for (const value of Object.values(startNode)) {
            recursiveDescend(value, selector, collector);
        }
        return collector;
    }
    // its a scalar
    // do nothing
}