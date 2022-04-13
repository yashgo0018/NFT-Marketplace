import ethers from "ethers";
import User from "./models/User.js";

export function uniqueAddress(address) {
    return User.findOne({
        where: {
            address
        }
    }).then(user => {
        if (!user) {
            return Promise.reject("User nonce not generated yet");
        }
        else if (user.isRegistered) {
            return Promise.reject("User already exists");
        }
    });
}

export function uniqueUsername(username) {
    return User.findOne({
        where: {
            username
        }
    }).then(user => {
        if (user) {
            return Promise.reject("Username already exists");
        }
    });
}

export function isRegistered(address) {
    return User.findOne({
        where: {
            address
        }
    }).then(user => {
        if (!(user && user.isRegistered)) {
            return Promise.reject("User not registered");
        }
    });
}

export function isValidAddress(address) {
    if (!ethers.utils.isAddress(address))
        throw new Error("Invalid address");
    return true;
}

export function isValidUsername(username) {
    const re = /^[A-Za-z]\w{3,}$/;
    if (!Boolean(re.test(username)))
        throw new Error("Invalid username");
    return true;
}

export function isSlug(slug) {
    const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!Boolean(re.test(slug)))
        throw new Error("Invalid slug");
    return true;
}