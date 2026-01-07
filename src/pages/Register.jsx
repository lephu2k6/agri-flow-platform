import React from 'react'
import { useState } from 'react'
import { registerUser } from '../services/authService'

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: '', role: 'seller'
  })

  const submit = async e => {
    e.preventDefault()
    await registerUser(form)
    alert('Đăng ký thành công')
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto p-6 space-y-3">
      <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})} />
      <input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})} />
      <input placeholder="Họ tên" onChange={e=>setForm({...form,full_name:e.target.value})} />
      <input placeholder="SĐT" onChange={e=>setForm({...form,phone:e.target.value})} />
      <select onChange={e=>setForm({...form,role:e.target.value})}>
        <option value="seller">Người bán</option>
        <option value="trader">Thương lái</option>
      </select>
      <button className="bg-green-600 text-white w-full py-2">Đăng ký</button>
    </form>
  )
}
