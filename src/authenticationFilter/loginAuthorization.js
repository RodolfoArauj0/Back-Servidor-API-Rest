const connection = require('../connection');
const jwt = require('jsonwebtoken');
const secretKey = require('../secretKey/secret');

const loginVerify = async (req, res, next) => {
    const { authorization } = req.headers;
    try {
        if (!authorization) {
            return res.status(401).json({ mensagem: 'Token não informado...' });
        }
        const token = authorization.replace('Bearer', '').trim();

        const { id } = jwt.verify(token, secretKey);

        const user = await connection.query('select * from usuarios where id = $1', [id]);

        if (user.rowCount === 0) {
            return res.status(401).json({ mensagem: 'Usuário não encontrado...' });
        }
        const { senha: _, ...userProps } = user.rows[0];

        req.user = userProps;

        next();
    } catch (error) {
        return res.status(401).json({ mensagem: 'Token expirado...' });
    }
};

module.exports = loginVerify;