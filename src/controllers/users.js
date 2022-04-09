const connection = require('../connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = require('../secretKey/secret');

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

const loginUser = async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Campos email e senha são obrigatórios!' })
        }
        const userLogin = await connection.query('select * from usuarios where email = $1', [email]);

        if (userLogin.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Usuário não cadastrado!' });
        };

        const passworEncrypted = await bcrypt.compare(senha, userLogin.rows[0].senha);

        if (!passworEncrypted) {
            return res.status(401).json({ mensagem: 'Usuário e/ou senha inválido(s)...' })
        }
        const token = jwt.sign({ id: userLogin.rows[0].id }, secretKey, { expiresIn: '1h' });

        const { senha: _, ...userProps } = userLogin.rows[0];

        return res.status(200).json({ usuario: userProps, token });

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

const detailProfileUser = async (req, res) => {
    const { user } = req;
    try {
        res.status(200).json({ usuario: user });
    } catch (error) {
        return res.status(401).json(!authorization ? { mensagem: 'Token não informado...' } : { mensagem: 'Token expirado...' })
    }
};

const editProfileUser = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { user } = req;
    const passworEncrypted = await bcrypt.hash(senha, 10);

    try {
        if (senha.length < 8) {
            return res.json({ mensagem: 'Senha precisa ter no mínimo 8 caracteres...' })
        }

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Campos nome, email e senha são obrigatórios!' })
        }
        if (email !== user.email) {
            const verifyEmail = await connection.query('select * from usuarios where email = $1', [email]);

            if (verifyEmail.rowCount > 0) {
                return res.status(400).json({ mensagem: 'E-mail existente na base de dados...' });
            }
        }

        const queryEdit = 'update usuarios set nome =$1, email= $2, senha=$3 where id = $4';
        const userEdit = await connection.query(queryEdit, [nome, email, passworEncrypted, user.id]);

        if (userEdit.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível atualizar perfil!' });
        }
        return res.status(204).json({ mensagem: 'Perfil atualizado com sucesso!' });

    } catch (error) {
        return res.status(401).json(error.message)
    }
};

module.exports = { registerUser, loginUser, detailProfileUser, editProfileUser }