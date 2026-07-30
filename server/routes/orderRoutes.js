const express=require("express");

const router=express.Router();

const{

placeOrder,

getOrders,

getOrder,

updateOrderStatus,

cancelOrder

}=require("../controllers/orderController");

router.post("/",placeOrder);

router.get("/",getOrders);

router.get("/:id",getOrder);

router.put("/status/:id",updateOrderStatus);

router.delete("/:id",cancelOrder);

module.exports=router;