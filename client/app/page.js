"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {

  const router = useRouter();

  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {

    const res = await fetch("http://localhost:5000/api/login",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        role,
        email,
        password
      })
    });

    const data = await res.json();

    if(data.success){

      if(data.role==="admin"){
        router.push("/frontend/admin/dashboard");
      }

      else if(data.role==="pharmacist"){
        router.push("/frontend/pharmacist/dashboard");
      }

      else if(data.role==="delivery"){
        router.push("/frontend/delivery/dashboard");
      }

      else{
        router.push("/frontend/user/dashboard");
      }

    }

    else{
      alert(data.message);
    }

  }

  return(

    <div>

      <h1>RxConnect Login</h1>

      <select onChange={(e)=>setRole(e.target.value)}>

        <option value="">Select Role</option>

        <option value="admin">Admin</option>

        <option value="pharmacist">Pharmacist</option>

        <option value="delivery">Delivery</option>

        <option value="customer">Customer</option>

      </select>

      <br/><br/>

      <input
      type="email"
      placeholder="Email"
      onChange={(e)=>setEmail(e.target.value)}
      />

      <br/><br/>

      <input
      type="password"
      placeholder="Password"
      onChange={(e)=>setPassword(e.target.value)}
      />

      <br/><br/>

      <button onClick={handleLogin}>
      Login
      </button>

    </div>

  );

}