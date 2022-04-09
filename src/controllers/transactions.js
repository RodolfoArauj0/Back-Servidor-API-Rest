const connection = require('../connection');


const listTransactions = async (req, res) => {
    const { user } = req;

    try {
        const queryList = `select t.id, t.tipo, t.descricao, t.valor, t.data, 
        t.usuario_id, t.categoria_id, c.descricao As "categoria_nome" from transacoes t
        left join categorias c on c.id = t.categoria_id where t.usuario_id =$1`

        const transactionList = await connection.query(queryList, [user.id]);
        if (transactionList.rowCount === 0) {
            res.status(200).json([]);
        }
        return res.status(200).json(transactionList.rows);
    } catch (error) {
        res.status(400).json({ "mensagem": error.message });
    }
};

const detailTransaction = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    try {
        await connection.query('select * from transacoes where usuario_id=$1', [user.id]);

        const queryDetail = `select t.id, t.tipo, t.descricao, t.valor, t.data, 
        t.usuario_id, t.categoria_id, c.descricao As "categoria_nome" from transacoes t
        left join categorias c on c.id = t.categoria_id where t.id =$1`;

        const transactionDetail = await connection.query(queryDetail, [id]);

        if (transactionDetail.rowCount === 0) {
            res.status(400).json({ mensagem: 'Transação não encontrada!' });
        }

        res.status(200).json(transactionDetail.rows);

    } catch (error) {
        return res.status(400).json({ "mensagem": error.message });
    }
};

const registerTransaction = async (req, res) => {
    const { user } = req;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios!' });
        }

        if (tipo !== "entrada" && tipo !== "saida") {
            return res.status(400).json({ mensagem: 'Tipo informado é inválido por favor, informe Entrada ou Saída!' });
        }

        const verifyCategory = await connection.query(`select * from categorias where id = $1`, [categoria_id]);

        if (verifyCategory.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Categoria não encontrada' });
        }

        const queryRegister = `insert into transacoes 
        (descricao, valor, data, categoria_id,usuario_id, tipo) 
        values($1,$2,$3,$4,$5,$6)returning* `;
        const transactionRegister = await connection.query(queryRegister, [descricao, valor, data, categoria_id, user.id, tipo]);

        if (transactionRegister.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível cadastrar a transação!' });
        }

        return res.status(200).json(transactionRegister.rows);

    } catch (error) {
        return res.status(400).json({ "mensagem": error.message });
    }
};

const editTransaction = async (req, res) => {
    const { user } = req;
    const { id } = req.params;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios!' });
        }
        if (tipo !== "entrada" && tipo !== "saida") {
            return res.status(400).json({ mensagem: 'Tipo informado é inválido por favor, informe Entrada ou Saída!' });
        }
        const query = `select * from transacoes where usuario_id = $1`
        const verifyUserTransaction = await connection.query(query, [user.id]);

        if (verifyUserTransaction === 0) {
            return res.status(400).json({ mensagem: 'Usuário não encontrado...' })
        }
        const queryEdit = `update transacoes set  descricao = $1, valor = $2, data = $3,  categoria_id = $4,  tipo = $5 where id= $6`;
        const editTransaction = await connection.query(queryEdit, [descricao, valor, data, categoria_id, tipo, id])
        if (editTransaction === 0) {
            return res.status(400).json({ mensagem: 'Transação não encontrada...' })
        }
        res.status(204).json(editTransaction.rows);

    } catch (error) {
        return res.status(400).json({ "mensagem": error.message });
    }
};

const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    try {
        const query = `select * from transacoes where usuario_id = $1`
        const verifyUserTransaction = await connection.query(query, [user.id]);
        if (verifyUserTransaction === 0) {
            return res.status(400).json({ mensgem: 'Usuário não encontrado!' });
        }

        const deleteTransation = await connection.query('delete from transacoes where id =$1', [id]);
        if (deleteTransation === 0) {
            return res.status(400).json({ mensgem: 'Transação não encontrada!' });
        }
        return res.status(204).json({ mensagem: 'transação excluída com sucesso' });

    } catch (error) {
        return res.status(400).json({ "mensagem": error.message });
    }
};

const extractOfValues = async (req, res) => {
    const { user } = req;
    try {
        const query = `select * from transacoes where usuario_id = $1`
        const verifyUserTransaction = await connection.query(query, [user.id]);
        if (verifyUserTransaction === 0) {
            return res.status(400).json({ mensgem: 'Usuário não encontrado!' });
        }

        const querySum = `select case when tipo = 'entrada' then sum(valor) else 0 from transacoes group by tipo`;
        const rows = await connection.query(querySum);

        return res.status(200).json(rows);

    } catch (error) {
        return res.status(400).json({ "mensagem": error.message });
    }
};



module.exports = {
    registerTransaction,
    editTransaction,
    deleteTransaction,
    listTransactions,
    detailTransaction,
    extractOfValues
}