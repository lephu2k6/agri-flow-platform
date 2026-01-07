import React from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const login = async e => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value
    await supabase.auth.signInWithPassword({ email, password })
  }

  return (
    <form onSubmit={login} className="max-w-md mx-auto p-6 space-y-3">
      <input name="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button className="bg-blue-600 text-white w-full py-2">Đăng nhập</button>
    </form>
  )
}
