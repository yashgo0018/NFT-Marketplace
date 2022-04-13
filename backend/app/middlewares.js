import { validationResult } from "express-validator";

export function paginate(defaultLimit = 10) {
    return (req, res, next) => {
        let { limit, page } = req.query;
        const errors = []
        if (!limit) {
            req.query.limit = defaultLimit;
        } else {
            if (typeof limit === 'string') {
                try {
                    req.query.limit = parseInt(limit);
                    if (req.query.limit <= 0) {
                        errors.push({
                            msg: "limit value can only be positive number",
                            param: "limit",
                            location: "query"
                        });
                    }
                } catch (err) {
                    errors.push({
                        msg: "invalid limit value",
                        param: "limit",
                        location: "query"
                    });
                    req.query.limit = undefined;
                }
            }
        }
        if (!page) {
            req.query.page = 1;
        } else {
            if (typeof page === 'string') {
                try {
                    req.query.page = parseInt(page);
                    if (req.query.page <= 0) {
                        errors.push({
                            msg: "page value can only be positive number",
                            param: "page",
                            location: "query"
                        });
                    }
                } catch (err) {
                    errors.push({
                        msg: "invalid page value",
                        param: "page",
                        location: "query"
                    });
                    req.query.page = undefined;
                }
            }
        }
        if (errors.length !== 0)
            req.paginationErrors = errors;
        else
            req.query.offset = req.query.limit * (req.query.page - 1);
        next();
    }
}

export function file(name, type) {
    return (req, res, next) => {
        let error;
        if (!req.files || !req.files[name]) {
            error = {
                msg: "file not found",
                param: name,
                location: "body"
            };
        } else {
            const file = req.files[name];
            if (!file.mimetype.includes(type)) {
                error = {
                    msg: "invalid file format",
                    param: name,
                    location: "body"
                };
            }
        }
        if (!error) return next();
        if (typeof req.fileErrors === 'object') {
            req.fileErrors.push(error);
        } else {
            req.fileErrors = [error];
        }
        return next();
    }
}

export function files(name, type, min = 1, max = 5) {
    return (req, res, next) => {
        let error;
        if (!req.files || !req.files[name]) {
            if (min === 0) {
                if (!req.files)
                    req.files = {};
                req.files[name] = [];
                return next();
            }
            error = {
                msg: "files not found",
                param: name,
                location: "body"
            };
        } else {
            let files = req.files[name];
            if (files.length === undefined) {
                req.files[name] = [files];
                files = req.files[name];
            }
            if (files.some(file => !file.mimetype.includes(type))) {
                error = {
                    msg: "invalid file format",
                    param: name,
                    location: "body"
                };
            } else if (files.length < min) {
                error = {
                    msg: `minimum ${min} files are required`,
                    param: name,
                    location: "body"
                }
            } else if (files.length > max) {
                error = {
                    msg: `maximum ${max} files allowed`,
                    param: name,
                    location: "body"
                }
            }
        }
        if (!error) return next();
        if (typeof req.fileErrors === 'object') {
            req.fileErrors.push(error);
        } else {
            req.fileErrors = [error];
        }
        return next();
    }
}

export function validate(req, res, next) {
    const result = validationResult(req);
    let errors = result.array().concat(req.fileErrors || []).concat(req.paginationErrors || []);
    if (errors.length !== 0) {
        return res.status(422).json({ errors });
    }
    next();
}