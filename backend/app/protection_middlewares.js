import { verifyJWTToken } from "./helpers.js";
import sequelize from "./database.js";
const { users: User } = sequelize.models;

export async function onlyAuthorized(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(400).json({ message: "authorization token not found" });
    }
    if (!(authorization.startsWith("Bearer") && authorization.split(" ").length == 2)) {
        return res.status(400).json({ message: "authorization token is in invalid format" });
    }
    const token = authorization.split(' ')[1];
    const decoded = verifyJWTToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "Invalid authorization token" });
    }
    const user = await User.findOne({ where: { address: decoded.username, isRegistered: true } });
    if (!user) {
        return res.status(401).json({ message: "The user associated to this authorization token not found" });
    }
    req.user = user;
    next();
}

export async function onlyAdmin(req, res, next) {
    const { user } = req;
    if (!user.isAdmin) return res.status(401).json({ message: "Only Admin Allowed" });
    next();
}