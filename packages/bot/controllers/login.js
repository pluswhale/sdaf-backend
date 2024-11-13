import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const userRepository = AppDataSource.getRepository(User);
export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await userRepository.findOne({ where: { username } });
        if (user && (await bcrypt.compare(password, user.password))) {
            const secretKey = process.env.SECRET_JWT_KEY;
            const accessToken = jwt.sign({ user }, secretKey, { expiresIn: '1h' });
            const refreshToken = jwt.sign({ user }, secretKey, { expiresIn: '1d' });
            res
                .setHeader('Access-Control-Allow-Credentials', 'true')
                .setHeader('Access-Control-Expose-Headers', 'Authorization, Set-Cookie')
                .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
                .header('Authorization', accessToken)
                .status(200)
                .send({ refreshToken, accessToken });
        }
        else {
            res.status(401).send('Invalid credentials');
        }
    }
    catch (error) {
        res.status(500).send('Error during login: ' + error);
    }
};
