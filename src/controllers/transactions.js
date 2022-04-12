const connection = require('../connection');

const listTransactions = async (req, res) => {
    const { user } = req;
    const {id} = req.params;
    let {filtro}  = req.query;

    if(!id){
        try {
            const queryList = `select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, 
            c.descricao As "categoria_nome" from transacoes t left join categorias c on c.id = t.categoria_id 
            where t.usuario_id =$1`;
            const transactionList = await connection.query(queryList, [user.id]);   
            
            if (transactionList.rowCount === 0) {
                res.status(200).json([]);
            }
    
            if (filtro) {            
            const queryCategory = `select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, 
            c.descricao as categoria_nome from transacoes t full join categorias c on c.id = t.categoria_id 
            where t.usuario_id = $1 and t.categoria_id in (${filtro})`;
            const listCategory = await connection.query(queryCategory, [user.id]);   
                
                return res.status(200).json(listCategory.rows);
            } 
            return res.status(200).json(transactionList.rows);
    
        } catch (error) {
            res.status(400).json({ "mensagem": error.message });
        }
    }
    else{
        try {
            const queryDetail = `select t.id, t.tipo, t.descricao, t.valor, t.data, 
            t.usuario_id, t.categoria_id, c.descricao As "categoria_nome" from transacoes t
            left join categorias c on c.id = t.categoria_id where t.usuario_id = $1 and t.id =$2`;
            const transactionDetail = await connection.query(queryDetail, [user.id, id]);
            
            if (transactionDetail.rowCount === 0 || !id) {
            return res.status(400).json({ mensagem: 'Transação não encontrada!' });
            }
            res.status(200).json(transactionDetail.rows);
    
        } catch (error) {
            return res.status(400).json({ "mensagem": error.message });
        }
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

        const query = `select t.id, t.tipo, t.descricao, t.valor, t.data, 
        t.usuario_id, t.categoria_id, c.descricao As "categoria_nome" from transacoes t
        left join categorias c on c.id = t.categoria_id where t.id =$1`;
        const transactionRegisterUser = await connection.query(query, [transactionRegister.rows[0].id])
        return res.status(200).json(transactionRegisterUser.rows);

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
        res.status(204).json();

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
        if (deleteTransation.rowCount === 0) {
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
        const querySumExit = `select sum(valor) as "saida" from transacoes where tipo='saida' and usuario_id = $1 group by tipo`;
        const rowsExit = await connection.query(querySumExit,[user.id]);

        const querySum = `select sum(valor) as "entrada" from transacoes where tipo='entrada' and usuario_id = $1 group by tipo`;
        const rows = await connection.query(querySum,[user.id]);

        return res.status(200).json({
            entrada: rows.rowCount && Number(rows.rows[0].entrada),
            saida: rowsExit.rowCount && Number(rowsExit.rows[0].saida)
        });

    } catch (error) {
        return res.status(400).json({ "mensagem": error.message });
    }
};

module.exports = {
    registerTransaction,
    editTransaction,
    deleteTransaction,
    listTransactions,
    extractOfValues
}