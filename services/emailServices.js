const nodemailer = require("nodemailer");
var inlineBase64 = require("nodemailer-plugin-inline-base64");
var cron = require("node-cron");
const TicketBooking = require("../models/TicketBooking");

require("dotenv").config();

const mailerOptions = {
  port: process.env.ENVIRONMENT == "PROD" ? 465 : 587,
  secure: process.env.ENVIRONMENT == "PROD",
}

// async..await is not allowed in global scope, must use a wrapper
class emailService {
  async sendEmail(req, res) {
    const name = req.body.taiKhoan;
    const cinemaClusterName = req.body.tenCumRap;
    const movieName = req.body.tenPhim;
    const QRCode = req.body.QRCode;
    const showtimeDate = req.body.ngayChieu;
    const showtimeTime = req.body.gioChieu;
    const { soLuongVe, donGiaVe, tongTienVe, Combo, tongTienCombo, tongTienBanDau, diemDaSuDung, tongTienThanhToan } = req.body
    //  const QR = req.params.QRCode

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: mailerOptions.port,
      secure: mailerOptions.secure, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    transporter.use("compile", inlineBase64({ cidPrefix: "somePrefix_" }));
    let img = `<img src="` + QRCode + `"/>`;

    let comboHtml = ``;
    Combo.forEach((comboItem) => {
      let tongTienCombo = comboItem.soLuongCombo * comboItem.donGiaCombo
      comboHtml += `<p style="text-align: left;"><strong>Combo đã đặt:</strong> ${comboItem.tenCombo}</p>
        <p style = "text-align: left;" > <strong>Thành tiền:</strong> ${Number(comboItem.donGiaCombo).toLocaleString("it-IT", { style: "currency", currency: "VND" })} X ${comboItem.soLuongCombo} =  ${Number(tongTienCombo).toLocaleString("it-IT", { style: "currency", currency: "VND" })}</p >`
    })
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "CGV", // sender address
      to: process.env.SEND_TO, // list of receivers
      subject: "Hoàn tất đặt vé CGV ✔", // Subject line
      //text: 'Hello world?', // plain text body
      html: `<p style='text-align: justify;'><span style='color: #b96ad9;'><strong>Xin chào ${name},</strong></span></p>
            <p style="text-align: justify;">CGV cám ơn quý khách đã thực hiện mua vé:</p>
            <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic; text-align: justify;">Phim ${movieName}&nbsp;chiếu v&agrave;o<span style="background-color: #ffffff;"> 
            <strong>${showtimeDate}</strong>
            </span> l&uacute;c 
            <strong>${showtimeTime}&nbsp;</strong>tại rạp ${cinemaClusterName}.</p>
            <p style="text-align: left;"><strong>Tổng tiền vé:</strong> ${Number(donGiaVe).toLocaleString("it-IT", { style: "currency", currency: "VND" })} X ${soLuongVe} = ${Number(tongTienThanhToan).toLocaleString("it-IT", { style: "currency", currency: "VND" })}</p>
            `+ comboHtml + `
            <p style="text-align: left;"><strong>Tổng tiền combo:</strong> ${Number(tongTienCombo).toLocaleString("it-IT", { style: "currency", currency: "VND" })}</p>
            <p style="text-align: left;"><strong>Tiền chưa sử dụng điểm tích lũy:</strong> ${Number(tongTienBanDau).toLocaleString("it-IT", { style: "currency", currency: "VND" })}</p>
            <p style="text-align: left;"><strong>Số điểm tích lũy đã dùng:</strong> ${diemDaSuDung} X 1.000 = ${diemDaSuDung * 1000}</p>
            <p style="text-align: left;"><strong>Tiền đã thanh toán:</strong> ${Number(tongTienThanhToan).toLocaleString("it-IT", { style: "currency", currency: "VND" })}</p>
            <p>Vui lòng lưu lại mã QR về điện thoại. Mã này sẽ được dùng trước quầy soát vé</p>
            <p>${img}</p>
            <p>Trân trọng,<br />CGV team</p>`,
    });

    if (info) res.status(200).json({ message: "Đã gửi email" });
    else res.status(400).json({ error: "Gửi email thất bại" });
  }

  async sendReminderMail(req, res) {
    let ticketToday = [];
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
    cron.schedule("*/5 * * * *", async () => {
      //
      let ticketToday = [];
      await TicketBooking.find({})
        .populate("maLichChieu")
        .populate("tentaiKhoan")
        .populate("phim")
        .then((data) => {
          if (data) {
            data.forEach((ticket) => {
              // console.log(ticket.maLichChieu)
              if (!ticket?.maLichChieu?.ngayChieu) {
                // console.log("ticket nay bi null:", ticket._id)
                return;
              }
              const date = new Date(ticket.maLichChieu.ngayChieu).getTime();
              //  console.log('Ngày chiếu', ticket.maLichChieu.ngayChieu.getDate())
              const dateNow = new Date().getTime();
              // console.log(">> datenow", dateNow)
              // console.log(">> getdDate", date)
              // console.log(">> getdDate - datenoew", getdDate - dateNow)
              // console.log(">> 1 hour", 60 * 60 * 1000)
              if (date - dateNow >= 60 * 59 * 1000 && date - dateNow <= 60 * 60 * 1000) {
                ticketToday.push(ticket);
                //console.log(">> log", ticketToday)
              }
            });
          }
        })
        .catch((err) => console.log(err.toString()));
      ticketToday.forEach(async (ticket) => {
        //console.log('ticket', ticket)
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: mailerOptions.port,
          secure: mailerOptions.secure, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_ACCOUNT,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        transporter.use("compile", inlineBase64({ cidPrefix: "somePrefix_" }));

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: "CGV", // sender address
          to: process.env.SEND_TO, // list of receivers
          subject: "Thư nhắc: Bạn có một lịch xem phim hôm nay ✔", // Subject line
          //text: 'Hello world?', // plain text body
          html: `<p style='text-align: justify;'><span style='color: #b96ad9;'><strong>Xin chào ${ticket.tentaiKhoan.hoTen
            },</strong></span></p>
                            <p style="text-align: justify;">CGV muốn chắc chắn quý khách không bỏ lỡ buổi chiếu phim hôm nay</p>
                            <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic; text-align: justify;">Phim ${ticket.phim.tenPhim
            }&nbsp;chiếu v&agrave;o<span style="background-color: #ffffff;"> <strong>${formatDate(
              ticket.maLichChieu.ngayChieu
            )}</strong> lúc <strong>${formatTime(
              ticket.maLichChieu.ngayChieu
            )}</strong></span></p>
                            <p>Vui lòng lưu lại mã QR ở mail đặt vé trước đó để tiện cho việc soát vé ở rạp</p>                  
                            <p>Trân trọng,<br />CGV team</p>`,
        });
        // if (info) res.status(200).json({ message: "Đã gửi email" });
        // else res.status(400).json({ error: "Gửi email thất bại" });
      });
      //
    });
  }

  async sendchangeTicketMail(req, res) {
    const name = req.body.taiKhoan;
    const cinemaClusterName = req.body.tenCumRap;
    const movieName = req.body.tenPhim;
    const QRCode = req.body.QRCode;
    const showtimeDate = req.body.ngayChieu;
    const showtimeTime = req.body.gioChieu;
    //  const QR = req.params.QRCode

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: mailerOptions.port,
      secure: mailerOptions.secure, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    transporter.use("compile", inlineBase64({ cidPrefix: "somePrefix_" }));
    let img = `<img src="` + QRCode + `"/>`;
    // console.log('hình', img)
    //
    // const url = nodemailer.getTestMessageUrl(QRCode)
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "CGV", // sender address
      to: process.env.SEND_TO, // list of receivers
      subject: "Bạn đã đổi vé thành công ✔", // Subject line
      //text: 'Hello world?', // plain text body
      html: `<p style='text-align: justify;'><span style='color: #b96ad9;'><strong>Xin chào ${name},</strong></span></p>
            <p style="text-align: justify;">CGV gửi tới quý khách thông tin ghế mới::</p>
            <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic; text-align: justify;">Phim ${movieName}&nbsp;chiếu v&agrave;o<span style="background-color: #ffffff;"> <strong>${showtimeDate}</strong></span> l&uacute;c <strong>${showtimeTime}&nbsp;</strong>tại rạp ${cinemaClusterName}.</p>
            <p>Vui lòng lưu lại mã QR về điện thoại. Mã này sẽ được dùng trước quầy soát vé</p>
            <p>${img}</p>
            <p>Trân trọng,<br />CGV team</p>`,
    });

    if (info) res.status(200).json({ message: "Đã gửi email" });
    else res.status(400).json({ error: "Gửi email thất bại" });
  }
}
module.exports = new emailService();
