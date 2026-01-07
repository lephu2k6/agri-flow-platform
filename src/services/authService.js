import { supabase } from '../lib/supabase'

/**
 * Đăng ký user mới
 */
export const registerUser = async ({
  email,
  password,
  full_name,
  phone,
  role
}) => {
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) throw error

  // 2. Tạo profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      full_name,
      phone,
      role
    })

  if (profileError) throw profileError

  return data.user
}

/**
 * Đăng nhập
 */
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data.user
}

/**
 * Đăng xuất
 */
export const logoutUser = async () => {
  await supabase.auth.signOut()
}
