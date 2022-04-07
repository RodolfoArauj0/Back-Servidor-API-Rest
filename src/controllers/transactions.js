const connection = require('../connection');
const jwt = require('jsonwebtoken');
const secretKey = require('../secretKey/secret');


const listTransactions = (req, res) => {
    res.json({ Mensagem: 'Iniciado...' })
};

const detailTransaction = (req, res) => {
    res.json({ Mensagem: 'Iniciado...' })
};

const registerTransaction = (req, res) => {


};

const editTransaction = (req, res) => {
    res.json({ Mensagem: 'Iniciado...' })
};

const deleteTransaction
    = (req, res) => {
        res.json({ Mensagem: 'Iniciado...' })
    };


module.exports = { registerTransaction, editTransaction, deleteTransaction, listTransactions, detailTransaction }