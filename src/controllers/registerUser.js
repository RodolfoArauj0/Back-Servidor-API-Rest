const connection = require('../connection');
const bcrypt = require('bcrypt');


const registerUser = async (req, res) => {
    const { nome, email, senha } = req.body;
    const passworEncrypted = await bcrypt.hash(senha, 10);

    try {
        if (senha.length < 8) {
            return res.json({ mensagem: 'Senha precisa ter no mínimo 8 caracteres...' })
        }

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Campos nome, email e senha são obrigatórios!' })
        }

        const queryRegister = 'insert into usuarios (nome, email, senha) values($1,$2,$3)';
        const user = await connection.query(queryRegister, [nome, email, passworEncrypted]);

        if (user.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível cadastrar usuário!' });
        }
        return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        return res.status(400).json({ mensagem: 'Já existe um usuário cadastrado com o e-mail informado...' })
    }
};

module.exports = registerUser;