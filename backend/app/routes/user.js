import { Router } from "express";
import { param } from "express-validator";
import { file, validate } from "../middlewares.js";
import { toChecksumAddress } from "../sanitizers.js";
import { isValidAddress, isValidUsername } from "../validators.js";
import sequelize from "../database.js";
import { onlyAuthorized } from "../protection_middlewares.js";
import updateObj from "../updateObj.js";

const { User } = sequelize.models;

const router = Router();

router.get(
    "/address/:address",
    param("address")
        .custom(isValidAddress)
        .customSanitizer(toChecksumAddress),
    validate,
    async (req, res) => {
        const { address } = req.params;
        const user = await User.findOne({
            where: {
                address,
                isRegistered: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    }
)

router.get(
    "/username/:username",
    param("username")
        .isString(),
    validate,
    async (req, res) => {
        const { username } = req.params;
        const user = await User.findOne({
            where: {
                username,
                isRegistered: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    }
)

router.put(
    "/image",
    file("image", "image"),
    onlyAuthorized,
    async (req, res) => {
        const { user } = req;
        const { image } = req.files;
        const imageFileName = `${user.id}.${mime.getExtension(image.mimetype)}`;
        const imagePath = `./uploads/users/${imageFileName}`;
        image.mv(imagePath);
        user.image = `/uploads/users/${imageFileName}`;
        await user.save();
        res.json({ user });
    })

router.put(
    "/",
    onlyAuthorized,
    async (req, res) => {
        const { user } = req;
        const { username, name } = req.body;
        const [done, errors] = await updateObj(user, { username, name }, {
            username: {
                type: "string",
                validate: isValidUsername,
                async check(username) {
                    const user = await User.findOne({
                        where: {
                            username
                        }
                    });
                    if (user)
                        return "username already registered";
                    return null;
                }
            },
            name: {
                type: "string",
                validate(name) {
                    return name.length < 2;
                },
                check: (name) => null
            }
        })
        if (errors.length !== 0)
            return res.status(400).json({ errors });
        res.json({ message: "successfully updated the user" });
    }
)

export default router;