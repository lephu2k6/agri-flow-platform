import { supabase } from '../../lib/supabase'

class AuthService {
  // ================= REGISTER =================
  async register(userData) {
    try {
      const validationError = this.validateRegisterData(userData)
      if (validationError) throw new Error(validationError)

      const { error } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name.trim(),
            phone: this.normalizePhone(userData.phone),
            role: userData.role,
            province: userData.province || null
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      return {
        success: true,
        requiresConfirmation: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.'
      }

    } catch (error) {
      console.error('Register error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ================= LOGIN =================
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Vui lòng nhập email và mật khẩu')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) throw this.mapAuthError(error)

      const profile = await this.getUserProfile(data.user.id)

      return {
        success: true,
        user: data.user,
        profile
      }

    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ================= LOGOUT =================
  async logout() {
    await supabase.auth.signOut()
    return { success: true }
  }

  // ================= CURRENT USER =================
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const profile = await this.getUserProfile(session.user.id)

    return {
      user: session.user,
      profile,
      session
    }
  }

  // ================= PROFILE =================
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data

    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        profile: data
      }

    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ================= PASSWORD =================
  async forgotPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )

    if (error) throw error

    return {
      success: true,
      message: 'Đã gửi email đặt lại mật khẩu'
    }
  }

  async resetPassword(newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Mật khẩu phải có ít nhất 8 ký tự')
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    return {
      success: true,
      message: 'Đổi mật khẩu thành công'
    }
  }

  // ================= VALIDATION =================
  validateRegisterData(data) {
    const { full_name, email, phone, password, confirmPassword, role } = data

    if (!full_name || full_name.trim().length < 2)
      return 'Họ tên phải có ít nhất 2 ký tự'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Email không hợp lệ'

    if (!this.isValidPhone(phone))
      return 'Số điện thoại không hợp lệ'

    if (!password || password.length < 8)
      return 'Mật khẩu phải có ít nhất 8 ký tự'

    if (!this.isStrongPassword(password))
      return 'Mật khẩu phải có chữ hoa, chữ thường và số'

    if (password !== confirmPassword)
      return 'Mật khẩu xác nhận không khớp'

    if (!['farmer', 'buyer'].includes(role))
      return 'Vui lòng chọn vai trò'

    return null
  }

  isValidPhone(phone) {
    const phoneRegex = /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  isStrongPassword(password) {
    return (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    )
  }

  normalizePhone(phone) {
    return phone.replace(/\s/g, '').replace(/^0/, '+84')
  }

  // ================= ERROR MAP =================
  mapAuthError(error) {
    const map = {
      'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
      'Email not confirmed': 'Email chưa được xác thực',
      'User already registered': 'Email đã được đăng ký'
    }

    for (const key in map) {
      if (error.message.includes(key)) {
        return new Error(map[key])
      }
    }

    return error
  }
}

export const authService = new AuthService()
