import jwt from 'jsonwebtoken';
export const refreshToken = async (req, res) => {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
        return res.status(401).send('Access Denied. No refresh token provided.');
    }
    const secretKey = process.env.SECRET_JWT_KEY;
    try {
        const decoded = jwt.verify(refreshToken, secretKey);
        const accessToken = jwt.sign({ user: decoded.user }, secretKey, { expiresIn: '1h' });
        res.header('Authorization', accessToken).send(decoded.user);
    }
    catch (error) {
        return res.status(400).send('Invalid refresh token.');
    }
};
