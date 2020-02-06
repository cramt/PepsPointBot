export function getType(thing: any) {
    if (Array.isArray(thing)) {
        return "array"
    }
    if (thing === null) {
        return "null"
    }
    if (isNaN(thing)) {
        return "NaN"
    }
    return typeof thing
}