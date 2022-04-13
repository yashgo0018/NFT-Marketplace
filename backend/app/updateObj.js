async function updateObj(obj, updates, rules) {
    const errors = [];
    for (const field in updates) {
        if (!updates[field] || updates[field] === obj[field]) continue;
        if (typeof updates[field] !== rules[field].type || rules[field].validate(updates[field])) {
            errors.push({ field, message: `${field} has invalid value` });
            continue;
        }
        if (rules[field].check) {
            const errorMsg = rules[field].check(updates[field]);
            if (errorMsg) {
                errors.push({ field, message: errorMsg });
                continue;
            }
        }
        obj[field] = updates[field];
    }
    if (errors.length !== 0) return [false, errors];
    await obj.save();
    return [true, []];
}

export default updateObj;