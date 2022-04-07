const connection = require('../connection');
const jwt = require('jsonwebtoken');
const secretKey = require('../secretKey/secret');

const listCategory = (req, res) => {
    res.json({ Mensagem: 'Iniciado...' })
};


module.exports = { listCategory }