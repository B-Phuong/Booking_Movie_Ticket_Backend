
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const accountsRouter = require('./accounts');
const adminRouter = require('./admin');

function route(app) {
    app.use('/movies', moviesRouter);
    app.use('/admins', adminRouter);
    app.use('/users', usersRouter);
    app.use('/accounts', accountsRouter);
}

module.exports = route;