import { User } from "../models/schema.js";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

export const getAllUsers = async (req, res, next) => {
    try {
        // Get all users
        const users = await User.find();
        return res.status(200).json({ message: "ok", users });
    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }
};

export const usersignUp = async (req, res, next) => {
    try {
        // User signup
        const { name, email, password } = req.body;
        const hashedPassword = await hash(password, 10);
        const existingUser = await User.findOne({ email });

        //Uncomment these lines to simulate delay
        // const sleep = ms => new Promise(
        //     resolve => setTimeout(resolve, ms));

        // await sleep(5000);

        if (existingUser) {
            return res.status(401).send("user already registered");
        }

        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Create token and store cookies
        res.clearCookie(COOKIE_NAME, {
            domain: "localhost",
            httpOnly: true,
            signed: true,
            path: "/",
        });

        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: "localhost",
            expires,
            httpOnly: true,
            signed: true,
        });

        return res.status(201).json({ message: "ok", id: user._id.toString() });
    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }
};

export const userLogin = async (req, res, next) => {
    try {
        // User login
        const { email, password } = req.body;

        const user = await User.findOne({
            email,
        });

        //Uncomment these lines to simulate delay
        // const sleep = ms => new Promise(
        //     resolve => setTimeout(resolve, ms));

        // await sleep(5000);

        if (!user) {
            return res.status(401).send("user not registered");
        }

        const isPasswordCorrect = await compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(403).send("incorrect password");
        }

        res.clearCookie(COOKIE_NAME, {
            domain: "localhost",
            httpOnly: true,
            signed: true,
            path: "/",
        });

        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: "localhost",
            expires,
            httpOnly: true,
            signed: true,
        });

        return res.status(200).json({ message: "ok", id: user._id.toString() });
    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }
};

export const verifyUser = async (req, res, next) => {
    try {
        // User token check
        const user = await User.findById(res.locals.jwtData.id);

        if (!user) {
            return res
                .status(401)
                .send("User not registered OR Token malfunctioned");
        }

        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }

        return res
            .status(200)
            .json({ message: "OK", name: user.name, email: user.email });
    } catch (error) {
        resolve();
        console.log(error);
        return res.status(404).json({ message: "ERROR", cause: error.message });
         
    }
};

export const userLogout = async (req, res, next) => {
    try {
        // User token check
        const user = await User.findById(res.locals.jwtData.id);

        if (!user) {
            return res
                .status(401)
                .send("User not registered OR Token malfunctioned");
        }

        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }

        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            domain: "localhost",
            signed: true,
            path: "/",
        });

        return res
            .status(200)
            .json({ message: "OK", name: user.name, email: user.email });
    } catch (error) {
        console.log(error);
        return res.status(404).json({ message: "ERROR", cause: error.message });
    }
};
