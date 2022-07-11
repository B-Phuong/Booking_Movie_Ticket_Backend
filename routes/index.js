
const userRouter = require('./user');
const movieRouter = require('./movie');
const accountRouter = require('./account');
const adminRouter = require('./admin');


function route(app) {
    app.use('/movie', movieRouter);
    app.use('/admin', adminRouter);
    app.use('/user', userRouter);
    app.use('/account', accountRouter);
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