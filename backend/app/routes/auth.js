import { Router } from 'express';
import { body, param } from "express-validator";
import { getNonceMessage, generateNonce, verifySignature, generateJWTToken } from '../helpers.js';
import sequelize from "../database.js";
import { isValidAddress, uniqueAddress, isRegistered, uniqueUsername, isValidUsername } from '../validators.js';
import { toChecksumAddress } from '../sanitizers.js';
import { file, validate } from '../middlewares.js';
import mime from 'mime';

const { User } = sequelize.models;
const router = Router();

router.get(
    "/get-nonce-message/:address",
    param('address')
        .custom(isValidAddress)
        .customSanitizer(toChecksumAddress),
    validate,
    async (req, res) => {
        const { address } = req.params;
        let [user] = await User.getOrCreate(address);
        res.json({
            message: getNonceMessage(user.nonce),
            registered: user.isRegistered
        });
    }
);

router.post(
    "/register",
    body("name")
        .isString()
        .isLength({ min: 2 }),
    file("image", "image"),
    body("username")
        .custom(uniqueUsername)
        .withMessage("Username not unique")
        .custom(isValidUsername)
        .withMessage("Username must be atleast 4 characters"),
    body("address")
        .custom(uniqueAddress)
        .custom(isValidAddress)
        .customSanitizer(toChecksumAddress),
    body("signature").isString(),
    validate,
    async (req, res) => {
        const { address, username, name, signature } = req.body;
        const { image } = req.files;
        const user = await User.findOne({ where: { address } });
        if (!user)
            return res.status(400).json({ message: "Nonce not generated yet" });
        if (user.isRegistered)
            return res.status(400).send({ message: "User already registered" });
        const isSignValid = verifySignature(getNonceMessage(user.nonce), signature, user.address);
        if (!isSignValid)
            return res.status(401).json({ message: "Invalid Signature" });
        const imageFileName = `${user.id}.${mime.getExtension(image.mimetype)}`;
        const imagePath = `./uploads/users/${imageFileName}`;
        image.mv(imagePath);
        user.username = username;
        user.name = name;
        user.nonce = generateNonce();
        user.isRegistered = true;
        user.image = `/uploads/users/${imageFileName}`;
        user.save();
        res.json({
            user,
            token: generateJWTToken(address)
        });
    }
);

router.post(
    "/login",
    body("address")
        .custom(isValidAddress)
        .custom(isRegistered)
        .customSanitizer(toChecksumAddress),
    body("signature")
        .isString(),
    validate,
    async (req, res) => {
        const { address, signature } = req.body;
        const user = await User.findOne({ where: { address } });
        const isSignValid = verifySignature(getNonceMessage(user.nonce), signature, address);
        if (!isSignValid)
            return res.status(401).json({ message: "Invalid Signature" });
        user.nonce = generateNonce();
        user.save();
        res.json({
            user,
            token: generateJWTToken(address)
        });
    }
);

router.get(
    "/is-username-available/:username",
    param("username")
        .custom(isValidUsername),
    validate,
    async (req, res) => {
        const { username } = req.params;
        const user = await User.findOne({ where: { username } });
        res.json({ available: !user });
    }
)

export default router;