import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

class AuthService {
  // =============== REGISTER ===============
  async register(userData) {
    try {
      // 1. Validate input
      const validationError = this.validateRegisterData(userData)
      if (validationError) {
        throw new Error(validationError)
      }

      // 2. Check if email already exists
      const emailExists = await this.checkEmailExists(userData.email)
      if (emailExists) {
        throw new Error('Email đã được đăng ký')
      }

      // 3. Sign up with Supabase Auth
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

      if (authError) {
        throw this.handleAuthError(authError)
      }

      // 4. Create profile (backup if trigger fails)
      if (authData.user) {
        await this.createUserProfile(authData.user.id, userData)
      }

      // 5. Return success data
      return {
        success: true,
        user: authData.user,
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

  // =============== LOGIN ===============
  async login(email, password) {
    try {
      // 1. Validate input
      if (!email || !password) {
        throw new Error('Vui lòng nhập email và mật khẩu')
      }

      // 2. Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (error) {
        throw this.handleAuthError(error)
      }

      // 3. Get or create user profile
      let profile = await this.getUserProfile(data.user.id)
      
      if (!profile) {
        profile = await this.createProfileFromAuth(data.user)
      }

      // 4. Update last login
      await this.updateLastLogin(data.user.id)

      // 5. Return success data
      return {
        success: true,
        user: data.user,
        profile: profile,
        message: 'Đăng nhập thành công!'
      }

    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // =============== LOGOUT ===============
  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new Error('Đăng xuất thất bại: ' + error.message)
      }

      return {
        success: true,
        message: 'Đăng xuất thành công'
      }

    } catch (error) {
      console.error('Logout error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // =============== FORGOT PASSWORD ===============
  async forgotPassword(email) {
    try {
      if (!email) {
        throw new Error('Vui lòng nhập email')
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw new Error('Không thể gửi email đặt lại mật khẩu: ' + error.message)
      }

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

  // =============== RESET PASSWORD ===============
  async resetPassword(newPassword) {
    try {
      if (!newPassword || newPassword.length < 8) {
        throw new Error('Mật khẩu phải có ít nhất 8 ký tự')
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw new Error('Không thể đặt lại mật khẩu: ' + error.message)
      }

      return {
        success: true,
        message: 'Đặt lại mật khẩu thành công'
      }

    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // =============== GET CURRENT USER ===============
  async getCurrentUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      if (!session) return null

      // Get user profile
      const profile = await this.getUserProfile(session.user.id)

      return {
        user: session.user,
        profile: profile,
        session: session
      }

    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // =============== UPDATE PROFILE ===============
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
        profile: data,
        message: 'Cập nhật thông tin thành công'
      }

    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // =============== HELPER METHODS ===============
  async checkEmailExists(email) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.trim())
        .maybeSingle()

      if (error) throw error
      return !!data

    } catch (error) {
      console.error('Check email exists error:', error)
      return false
    }
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null

    } catch (error) {
      console.error('Get user profile error:', error)
      return null
    }
  }

  async createUserProfile(userId, userData) {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: userData.full_name.trim(),
          phone: this.normalizePhone(userData.phone),
          province: userData.province || null,
          role: userData.role || 'buyer',
          created_at: new Date().toISOString()
        })

      if (error) throw error
      return true

    } catch (error) {
      console.error('Create user profile error:', error)
      return false
    }
  }

  async createProfileFromAuth(authUser) {
    try {
      const userMeta = authUser.user_metadata || {}
      
      const profileData = {
        id: authUser.id,
        full_name: userMeta.full_name || 
                  userMeta.name || 
                  authUser.email?.split('@')[0] || 
                  'User',
        phone: userMeta.phone || '',
        role: userMeta.role || 'buyer',
        province: userMeta.province || null,
        avatar_url: userMeta.avatar_url || userMeta.picture || null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single()

      if (error) throw error
      return data

    } catch (error) {
      console.error('Create profile from auth error:', error)
      return null
    }
  }

  async updateLastLogin(userId) {
    try {
      await supabase
        .from('profiles')
        .update({
          last_login: new Date().toISOString()
        })
        .eq('id', userId)

    } catch (error) {
      console.error('Update last login error:', error)
    }
  }

  // =============== VALIDATION ===============
  validateRegisterData(data) {
    const { full_name, email, phone, password, confirmPassword, role } = data

    if (!full_name || full_name.trim().length < 2) {
      return 'Họ tên phải có ít nhất 2 ký tự'
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Email không hợp lệ'
    }

    if (!phone || !this.isValidPhone(phone)) {
      return 'Số điện thoại không hợp lệ. VD: 0987654321'
    }

    if (!password || password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự'
    }

    if (!this.isStrongPassword(password)) {
      return 'Mật khẩu phải có chữ hoa, chữ thường và số'
    }

    if (password !== confirmPassword) {
      return 'Mật khẩu xác nhận không khớp'
    }

    if (!role || !['farmer', 'buyer'].includes(role)) {
      return 'Vui lòng chọn vai trò'
    }

    return null
  }

  isValidPhone(phone) {
    const phoneRegex = /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  isStrongPassword(password) {
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    return hasUpper && hasLower && hasNumber
  }

  normalizePhone(phone) {
    return phone.replace(/\s/g, '').replace(/^0/, '+84')
  }

  // =============== ERROR HANDLING ===============
  handleAuthError(error) {
    const errorMap = {
      'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
      'Email not confirmed': 'Email chưa được xác thực',
      'User not found': 'Tài khoản không tồn tại',
      'User already registered': 'Email đã được đăng ký',
      'Password should be at least': 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    for (const [key, message] of Object.entries(errorMap)) {
      if (error.message.includes(key)) {
        return new Error(message)
      }
    }

    return error
  }
}

export const authService = new AuthService()