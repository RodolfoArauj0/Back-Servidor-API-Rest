const route = require('express');
const routes = route();
const { registerUser, loginUser, editProfileUser, detailProfileUser } = require('./controllers/users')
const { listCategory } = require('./controllers/categories');
const { listTransactions, detailTransaction, registerTransaction, editTransaction, deleteTransaction, extractOfValues } = require('./controllers/transactions');
const loginVerify = require('./middleware/loginAuthorization');

routes.post('/user', registerUser);
routes.post('/login', loginUser);
routes.use(loginVerify);
routes.put('/user', editProfileUser);
routes.get('/user', detailProfileUser);
routes.get('/category', listCategory);
routes.get('/transactions', listTransactions);
routes.get('/transaction/extract', extractOfValues);
routes.get('/transaction/:id', detailTransaction);
routes.post('/transaction', registerTransaction);
routes.put('/transaction/:id', editTransaction);
routes.delete('/transaction/:id', deleteTransaction);

module.exports = routes