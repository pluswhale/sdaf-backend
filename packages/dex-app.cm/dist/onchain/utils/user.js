const plainSortObject = (objectValue) => Object.fromEntries(Object.entries(objectValue).sort(([keyA], [keyB]) => {
    if (keyA < keyB) {
        return -1;
    }
    if (keyA > keyB) {
        return 1;
    }
    return 0;
}));
const stableStringify = (objectValue) => {
    return JSON.stringify(objectValue, (_, value) => {
        if (typeof value === 'object' && value !== null) {
            return plainSortObject(value);
        }
        return value;
    });
};
export const isEqualUser = (userA, userB) => stableStringify(userA) === stableStringify(userB);
