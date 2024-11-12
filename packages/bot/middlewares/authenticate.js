import jwt from 'jsonwebtoken';
const authenticate = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    const accessToken = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.split(' ')[1] : null;
    const refreshToken = req.cookies?.refreshToken;
    console.log('refresh token', refreshToken);
    const secretKey = process.env.SECRET_JWT_KEY;
    if (!accessToken && !refreshToken) {
        return res.status(401).send('Access Denied. No token provided.');
    }
    try {
        const decoded = jwt.verify(accessToken, secretKey);
        req.user = decoded.user;
        next();
    }
    catch (error) {
        if (!refreshToken) {
            return res.status(401).send('Access Denied. No refresh token provided.');
        }
        try {
            const decoded = jwt.verify(refreshToken, secretKey);
            const newAccessToken = jwt.sign({ user: decoded.user }, secretKey, { expiresIn: '1h' });
            res
                .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
                .header('Authorization', `Bearer ${newAccessToken}`);
            req.user = decoded.user;
            next();
        }
        catch (error) {
            return res.status(400).send('Invalid Token.');
        }
    }
};
export { authenticate };
