export function uniqueFunc(arr: any, uniId: string) {
    const res = new Map();
    return arr.filter((item: any) => !res.has(item[uniId]) && res.set(item[uniId], 1));
}