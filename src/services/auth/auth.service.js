import { supabase } from '../../lib/supabase'

class AuthService {
  // ================= REGISTER =================
  async register(userData) {
    try {
      // 1. Kiểm tra dữ liệu đầu vào
      const validationError = this.validateRegisterData(userData)
      if (validationError) throw new Error(validationError)

      // 2. Đăng ký tài khoản qua Supabase Auth
      // Supabase Auth sẽ tự động kiểm tra email trùng lặp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name.trim(),
            phone: this.normalizePhone(userData.phone),
            role: userData.role || 'buyer',
            province: userData.province || null
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) throw this.handleAuthError(authError)

      /**
       * LƯU Ý: Không gọi createUserProfile thủ công ở đây nữa.
       * Database Trigger 'on_auth_user_created' sẽ tự động tạo dòng trong bảng profiles.
       */

      return {
        success: true,
        requiresConfirmation: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.'
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: error.message }
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
        password: password
      })

      if (error) throw this.handleAuthError(error)

      // Lấy Profile sau khi login thành công
      const profile = await this.getUserProfile(data.user.id)

      return {
        success: true,
        user: data.user,
        profile: profile,
        message: 'Chào mừng bạn quay trở lại!'
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

      if (error) return null
      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }

  async updateProfile(userId, updates) {
    try {
      // Loại bỏ email khỏi updates nếu có vì bảng profiles không có cột email
      const { email, ...validUpdates } = updates

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...validUpdates,
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
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      )

      if (error) throw this.handleAuthError(error)

      return {
        success: true,
        message: 'Đã gửi email đặt lại mật khẩu'
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async resetPassword(newPassword) {
    try {
      if (!newPassword || newPassword.length < 8) {
        throw new Error('Mật khẩu phải có ít nhất 8 ký tự')
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw this.handleAuthError(error)

      return {
        success: true,
        message: 'Đổi mật khẩu thành công'
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ================= VALIDATION =================
  validateRegisterData(data) {
    const { full_name, email, phone, password, confirmPassword, role } = data

    if (!full_name || full_name.trim().length < 2)
      return 'Họ tên phải có ít nhất 2 ký tự'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Email không hợp lệ'

    if (phone && !this.isValidPhone(phone))
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
    if (!phone) return false
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
    if (!phone) return ''
    return phone.replace(/\s/g, '').replace(/^0/, '+84')
  }

  // ================= ERROR HANDLING =================
  handleAuthError(error) {
    const errorMap = {
      'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
      'Email not confirmed': 'Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản.',
      'User already registered': 'Email này đã được đăng ký',
      'Email rate limit exceeded': 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
      'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    // Tìm error message phù hợp
    for (const key in errorMap) {
      if (error.message?.includes(key)) {
        return new Error(errorMap[key])
      }
    }

    // Nếu không tìm thấy, trả về error gốc
    return error
  }
}

export const authService = new AuthService()
