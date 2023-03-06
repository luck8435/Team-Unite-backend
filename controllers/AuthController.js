import UserModel from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Registering a new User
export const registerUser = async (req, res) => {
    const { username } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPass;
        const oldUser = await UserModel.findOne({ username });
        if (oldUser) return res.status(400).json({ message: 'username is already registered' });
        const newUser = new UserModel(req.body);
        const user = await newUser.save();
        const token = jwt.sign(
            {
                username: user.username,
            },
            process.env.JWT_KEY || 'highlysecuredkey',
            { expiresIn: '1d' }
        );
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// login User

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username: username });

        if (user) {
            const validity = await bcrypt.compare(password, user.password);

            if (!validity) return res.status(400).json('Wrong Password');
            else {
                const token = jwt.sign(
                    {
                        username: user.username,
                    },
                    process.env.JWT_KEY || 'highlysecuredkey',
                    { expiresIn: '1d' }
                );
                res.status(200).json({ user, token });
            }
        } else {
            res.status(404).json('User does not exists');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
