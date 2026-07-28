const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const users = [

{
role:"admin",
email:"admin@rxconnect.com",
password:"admin123"
},

{
role:"pharmacist",
email:"pharmacist@rxconnect.com",
password:"pharma123"
},

{
role:"delivery",
email:"delivery@rxconnect.com",
password:"delivery123"
},

{
role:"customer",
email:"customer@rxconnect.com",
password:"customer123"
}

];

app.post("/api/login",(req,res)=>{

const {role,email,password}=req.body;

const user=users.find(
u=>
u.role===role &&
u.email===email &&
u.password===password
);

if(user){

return res.json({
success:true,
role:user.role
});

}

res.status(401).json({
success:false,
message:"Invalid Credentials"
});

});

app.listen(5000,()=>{
console.log("Server Running...");
});