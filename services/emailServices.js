const nodemailer = require('nodemailer');
var inlineBase64 = require('nodemailer-plugin-inline-base64');
var cron = require('node-cron');
const TicketBooking = require('../models/TicketBooking');

require('dotenv').config()

// async..await is not allowed in global scope, must use a wrapper
class emailService {
    async sendEmail(req, res) {
        const name = req.body.name
        const cinemaClusterName = req.body.cinemaClusterName
        const movieName = req.body.movieName
        const QRCode = req.body.QRCode
        const showtimeDate = req.body.showtimeDate
        const showtimeTime = req.body.showtimeTime
        //  const QR = req.params.QRCode

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({

            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_ACCOUNT,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        transporter.use('compile', inlineBase64({ cidPrefix: 'somePrefix_' }));
        let img = `<img src="` + QRCode + `"/>`
        // console.log('hình', img)
        // 
        // const url = nodemailer.getTestMessageUrl(QRCode)
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'CGV', // sender address
            to: process.env.SEND_TO, // list of receivers
            subject: 'Hoàn tất đặt vé CGV ✔', // Subject line
            //text: 'Hello world?', // plain text body
            html: `<p style='text-align: justify;'><span style='color: #b96ad9;'><strong>Xin chào ${name},</strong></span></p>
            <p style="text-align: justify;">CGV cám ơn quý khách đã thực hiện mua vé:</p>
            <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic; text-align: justify;">Phim ${movieName}&nbsp;chiếu v&agrave;o<span style="background-color: #ffffff;"> <strong>${showtimeDate}</strong></span> l&uacute;c <strong>${showtimeTime}&nbsp;</strong>tại rạp ${cinemaClusterName}.</p>
            <p>Vui lòng lưu lại mã QR về điện thoại. Mã này sẽ được dùng trước quầy soát vé</p>
            <p>${img}</p>
            <p>Trân trọng,<br />CGV team</p>`,


        });

        if (info)
            res.status(200).json('Đã gửi email')
        else res.status(400).json('Gửi email thất bại')

    }

    async sendReminderMail(req, res) {

        let ticketToday = []
        // const dateNow = new Date()
        await TicketBooking.find({})
            .populate('maLichChieu')
            .populate('tentaiKhoan')
            .populate('phim')
            .then((data) => {
                if (data) {
                    data.forEach((ticket) => {
                        const date = new Date(ticket.maLichChieu.ngayChieu)
                        //  console.log('Ngày chiếu', ticket.maLichChieu.ngayChieu.getDate())
                        const dateNow = new Date()
                        console.log('Ngày hiện tại', dateNow.getHours(), dateNow.getMinutes())
                        if (date.getDate() === dateNow.getDate() && date.getMonth() === dateNow.getMonth() && date.getFullYear() === dateNow.getFullYear()) {
                            ticketToday.push(ticket)
                        }
                    })
                }
            })
            .catch(err => res.status(500).json(''))
        const formatDate = (date) => {
            if (date) {
                const d = new Date(date); //d.toLocaleString("en-AU")//
                return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
            }
            return "";
        };
        const formatTime = (date) => {
            if (date) {
                const d = new Date(date); //d.toLocaleString("en-AU")//
                const time = d.toLocaleString("en-AU", {
                    hour: "numeric",
                    minute: "numeric",
                });
                return time;
            }
            return "";
        };
        // const dateReminder = new Date()
        // dateReminder.setHours(12)
        // dateReminder.setMinutes(53)
        // console.log('thời gian hiện tại', dateReminder)
        cron.schedule("0 8 * * *", () => {

            //
            ticketToday.forEach(async (ticket) => {
                console.log('ticket', ticket)
                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.EMAIL_ACCOUNT,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                transporter.use('compile', inlineBase64({ cidPrefix: 'somePrefix_' }));
                // console.log('hình', img)
                // 
                // const url = nodemailer.getTestMessageUrl(QRCode)
                // send mail with defined transport object

                let info = await transporter.sendMail({
                    from: 'CGV', // sender address
                    to: process.env.SEND_TO, // list of receivers
                    subject: 'Thư nhắc: Bạn có một lịch xem phim hôm nay ✔', // Subject line
                    //text: 'Hello world?', // plain text body
                    html: `<p style='text-align: justify;'><span style='color: #b96ad9;'><strong>Xin chào ${ticket.tentaiKhoan.hoTen},</strong></span></p>
                            <p style="text-align: justify;">CGV muốn chắc chắn quý khách không bỏ lỡ buổi chiếu phim hôm nay</p>
                            <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic; text-align: justify;">Phim ${ticket.phim.tenPhim}&nbsp;chiếu v&agrave;o<span style="background-color: #ffffff;"> <strong>${formatDate(ticket.maLichChieu.ngayChieu)}</strong> lúc <strong>${formatTime(ticket.maLichChieu.ngayChieu)}</strong></span></p>
                            <p>Vui lòng lưu lại mã QR ở mail đặt vé trước đó để tiện cho việc soát vé ở rạp</p>                  
                            <p>Trân trọng,<br />CGV team</p>`,

                });
                if (info)
                    res.status(200).json('Đã gửi email')
                else res.status(400).json('Gửi email thất bại')


            })
            //
        })


    }

    async sendchangeTicketMail(req, res) {

        const name = req.body.name
        const cinemaClusterName = req.body.cinemaClusterName
        const movieName = req.body.movieName
        const QRCode = req.body.QRCode
        const showtimeDate = req.body.showtimeDate
        const showtimeTime = req.body.showtimeTime
        //  const QR = req.params.QRCode

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({

            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_ACCOUNT,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        transporter.use('compile', inlineBase64({ cidPrefix: 'somePrefix_' }));
        let img = `<img src="` + QRCode + `"/>`
        // console.log('hình', img)
        // 
        // const url = nodemailer.getTestMessageUrl(QRCode)
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'CGV', // sender address
            to: process.env.SEND_TO, // list of receivers
            subject: 'Bạn đã đổi vé thành công ✔', // Subject line
            //text: 'Hello world?', // plain text body
            html: `<p style='text-align: justify;'><span style='color: #b96ad9;'><strong>Xin chào ${name},</strong></span></p>
            <p style="text-align: justify;">CGV gửi tới quý khách thông tin ghế mới::</p>
            <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic; text-align: justify;">Phim ${movieName}&nbsp;chiếu v&agrave;o<span style="background-color: #ffffff;"> <strong>${showtimeDate}</strong></span> l&uacute;c <strong>${showtimeTime}&nbsp;</strong>tại rạp ${cinemaClusterName}.</p>
            <p>Vui lòng lưu lại mã QR về điện thoại. Mã này sẽ được dùng trước quầy soát vé</p>
            <p>${img}</p>
            <p>Trân trọng,<br />CGV team</p>`,


        });

        if (info)
            res.status(200).json('Đã gửi email')
        else res.status(400).json('Gửi email thất bại')


    }
}
module.exports = new emailService();
