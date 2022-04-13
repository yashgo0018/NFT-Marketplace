import jwt from 'jsonwebtoken';
import ethers from "ethers";
import mime from "mime";
import fs from 'fs';

export function getNonceMessage(nonce) {
    const template = process.env.NONCE_MESSAGE || "The Nonce is: %";
    return template.replace("%", nonce);
}

export function generateNonce() {
    const options = "ABCDEDFGHIJKLMNOPQRSTUVWXYZ";
    let nonce = "";
    for (let i = 0; i < 32; i++) {
        if (i !== 0 && i % 8 === 0) {
            nonce += "-";
        }
        nonce += options.charAt(Math.floor(Math.random() * options.length));
    }
    return nonce;
}

export function verifySignature(data, signature, address) {
    let signer;
    try {
        signer = ethers.utils.verifyMessage(data, signature);
    } catch (err) {
        return false;
    }
    return signer.toLowerCase() === address.toLowerCase();
}

export function generateJWTToken(address) {
    return jwt.sign({ username: address }, process.env.JWT_SECRET);
}

export function verifyJWTToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

export async function signMessage(hash) {
    const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY);
    const hashBytes = ethers.utils.arrayify(hash);
    const signature = await signer.signMessage(hashBytes);
    return signature;
}

export function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}

export function saveFile(basePath, file) {
    const randomNumber = Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000).toString();
    const filename = `${randomNumber}.${mime.getExtension(file.mimetype)}`;
    const filepath = `${basePath}/${filename}`;
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
    }
    file.mv(filepath);
    return filename;
}