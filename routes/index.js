
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const accountsRouter = require('./accounts');
const adminRouter = require('./admin');

function route(app) {
    app.use('/movies', moviesRouter);
    app.use('/admin', adminRouter);
    app.use('/users', usersRouter);
    app.use('/accounts', accountsRouter);
    // app.all('*', (req, res, next) => {
    //     const error = new Error("Xin hãy kiểm tra lại đường dẫn")
    //     res.status(404).json({
    //         message: error.message,
    //     })
    // });
    // app.use(errorHandler);


    // với re là reqiure và res là response


}

module.exports = route;