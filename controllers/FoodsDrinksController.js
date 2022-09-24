require('dotenv').config();
const FoodsAndDrinks = require('../models/FoodsAndDrink')
const TicketBooking = require('../models/TicketBooking')
const User = require('../models/User')
const { removeVietnameseTones } = require("../helper/formatString");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

class FoodsDrinksController {
    async getAll(req, res) {
        const foodsAndDrinks = await FoodsAndDrinks.find({ daXoa: false });
        res.status(200).json({ data: foodsAndDrinks });

    }
    async add(req, res) {
        const newCombo = new FoodsAndDrinks({
            ...req.body,
            hinhAnh: ""
        })
        const duplicateName = await FoodsAndDrinks.findOne({ tenCombo: newCombo.tenCombo })
        if (duplicateName)
            return res.status(400).json({ error: "Tên này đã được sử dụng" })
        else {
            let slug = removeVietnameseTones(newCombo.tenCombo)
            slug = slug.split(" ").join("-").toLowerCase()
            let allComboBySlug = await FoodsAndDrinks.find({
                "biDanh": {
                    "$regex": RegExp(slug, 'i')
                },
            }).sort({ "createdAt": 1 })
            if (allComboBySlug.length > 0) {
                let filterLastCombo = allComboBySlug[allComboBySlug.length - 1].tenCombo.split("-")
                let slugNumber = Number(filterLastCombo[filterLastCombo.length - 1])
                if (slugNumber)
                    slugNumber++
                else
                    slugNumber = 1
                slug += `-${slugNumber}`
            }
            newCombo.biDanh = slug;
        }
        //console.log("-----Combo:", newCombo)
        try {
            const fileStr = req.file.path;
            const uploadResponse = await cloudinary.uploader.upload(fileStr, { folder: "BookingTicket", use_filename: true });
            // console.log("-----uploadResponse", uploadResponse)
            newCombo.hinhAnh = uploadResponse.url;
            newCombo.maHinhAnh = uploadResponse.public_id;
            // console.log("----newCombo", newCombo)
            await newCombo.save()
            res.status(201).json({ message: 'Thêm combo thành công', data: newCombo })
        } catch (err) {
            res.status(500).json({ error: 'Thêm combo thất bại' });
        }
    }

    async update(req, res) {
        const comboInfo = await FoodsAndDrinks.findOne({ biDanh: req.params.bidanh })
        if (comboInfo) {
            console.log("----comboInfo", comboInfo)
            const comboUpdate = {
                ...comboInfo._doc,
                ...req.body,
            }
            console.log("----comboUpdate", comboUpdate)
            try {
                const fileStr = req.file.path;
                const uploadResponse = await cloudinary.uploader.upload(fileStr, { folder: "BookingTicket", use_filename: true });
                console.log(uploadResponse)
                comboUpdate.hinhAnh = uploadResponse.url;
                comboUpdate.maHinhAnh = uploadResponse.public_id;
                cloudinary.uploader.destroy(comboInfo.maHinhAnh, { type: "upload" });
            } catch (err) {
                res.status(500).json({ error: 'Cập nhật thất bại' });
            }
            FoodsAndDrinks.findOneAndUpdate({ biDanh: req.params.bidanh }, comboUpdate)
                .then((data) => {
                    if (data) {
                        res.status(200).json({ message: "Cập nhật thành công", data: data });
                    } else {
                        res.status(404).json({ error: "Cập nhật thất bại" });
                    }
                })
                .catch((err) => {
                    return res.status(500).json({ error: "Hệ thống đang xử lý, vui lòng chờ" });
                });
        }
    }

    async getDetail(req, res) {
        let detail = await FoodsAndDrinks.findOne({ _id: req.params.id, daXoa: false })
        return res.status(200).json({ data: detail })
    }

    async foodDrinkBooking(req, res) {
        let ticketBooking = await TicketBooking.findOne({ _id: req.body.id })
        let foodList = req.body?.danhSachAnUong
        let total = ticketBooking.tienThanhToan;
        let usedPoint = req.body.diemSuDung;
        ticketBooking.danhSachAnUong = foodList
        foodList?.map((item) => {
            total += item.soLuong * item.giaTien
        })
        ticketBooking.tienThanhToan = total
        ticketBooking.save()
            .then(async () => {
                User.findOne({ _id: req.user })
                    .then((data) => {
                        if (data) {
                            if (usedPoint == 0) {
                                // console.log('ĐIỂM THƯỞNG', rewardPoints)
                                data.diemThuong += Math.round((ticketBooking.tienThanhToan) / 1000 * 0.05)
                                data.save()
                                    .then(() => res.status(200).json({ message: "Đặt vé thành công", data: data }))
                                    .catch(() => res.status(500).json({ error: 'Đã xảy ra lỗi' }))
                            } else {
                                // console.log('ĐIỂM THƯỞNG', rewardPoints)
                                data.diemThuong += Math.round((ticketBooking.tienThanhToan - usedPoint * 1000) / 1000 * 0.05)
                                data.save()
                                    .then(() => res.status(200).json({ message: "Đặt vé thành công", data: data }))
                                    .catch(() => res.status(500).json({ error: 'Đã xảy ra lỗi' }))
                            }
                        }
                    })
                    .catch(() => res.status(500).json({ error: 'Đã xảy ra lỗi' }))
            })
    }
}
module.exports = new FoodsDrinksController;