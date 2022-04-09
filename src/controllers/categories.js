const connection = require('../connection');
const jwt = require('jsonwebtoken');
const secretKey = require('../secretKey/secret');

const listCategory = async (req, res) => {
    const { authorization } = req.headers;
    const { user } = req;

    try {
        const token = authorization.replace('Bearer', '').trim();
        const { id } = jwt.verify(token, secretKey);
        if (user.id !== id) {
            return res.status(400).json({ mensagem: 'Usuário sem autorização...' })
        }

        const query = await connection.query('select * from categorias');
        res.status(200).json(query.rows);

        if (query.rowCount === 0) {
            return res.status(400).json([]);
        };

    } catch (error) {
        res.status(401).json(!authorization ? { mensagem: 'Token não informado...' } : { mensagem: 'Token expirado...' })
    }
};
module.exports = { listCategory }