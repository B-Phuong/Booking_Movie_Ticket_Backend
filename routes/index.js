
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const accountsRouter = require('./accounts');
const adminRouter = require('./admin');

function route(app) {
    app.use('/movies', movieRouter);
    app.use('/admins', adminRouter);
    app.use('/users', userRouter);
    app.use('/accounts', accountRouter);
}

module.exports = route;