
// const PreOrder = require("../models/PreOrder");
// const Showtime = require("../models/Showtime");
// var cron = require("node-cron");
// const { startSession } = require("../models/Showtime");
// class removePreOreder {
//     async remove() {
//         cron.schedule("* * * * *", async () => {
//             const dateNow = new Date();
//             const After1MinDateNow = dateNow.setMinutes(dateNow.getMinutes() + 1)
//             let preOrderToDelete = await PreOrder.find({ thoiHan: { $gt: dateNow }, thoiHan: { $lt: After1MinDateNow } })
//             let showtimeID = []
//             preOrderToDelete.forEach(async (preorder) => {
//                 let countDown = After1MinDateNow - preorder.thoiHan
//                 setTimeout(() => {

//                 },)
//              // console.log(">> After1MinDateNow", After1MinDateNow)
//                 showtimeID.push(preorder.maLichChieu)
//                 // console.log(">> currentSlots", currentSlots)
//                 // let uniqueshowtimeID = [...new Set(showtimeID)];
//                 // uniqueshowtimeID.forEach
//                 // async (id) => {
//                 let updateShowtime = await Showtime.findById(preorder.maLichChieu)
//              // console.log(">> updateShowtime", updateShowtime)
//                 let currentSlots = updateShowtime.gheDangChon || []
//                 gheDangChon.forEach((chair) => {
//                     var index = currentSlots.findIndex((element) => element == chair);
//                     if (index !== -1) {
//                         // console.log(">> ghế đã chọn", chair)
//                         let newArray = currentSlots.splice(index, 1);
//                         // // console.log(">> new Array", newArray, currentSlots)
//                      // console.log(">> currentSlots", currentSlots)
//                         updateShowtime.gheDangChon = currentSlots
//                     }
//                 })
//                 await updateShowtime.save()

//                 await PreOrder.deleteMany({ thoiHan: { $gt: dateNow }, thoiHan: { $lt: After1MinDateNow } })
//             })
//         })
//     }
// }
// module.exports = new removePreOreder();