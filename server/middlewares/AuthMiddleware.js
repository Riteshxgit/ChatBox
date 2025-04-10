import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        if(!token) return res.status(401).send('you are not authenticated');
        jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
            if(err) return res.status(403).send('invalid token');
            req.userId = payload.id;
            next();
        });
    } catch (error) {
        return res.status(500).json({msg: 'error occured', error})
    }
}