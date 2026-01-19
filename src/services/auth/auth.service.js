<<<<<<< HEAD
import { supabase } from '../../lib/supabase'

class AuthService {
  // ================= REGISTER =================
  async register(userData) {
    try {
      const validationError = this.validateRegisterData(userData)
      if (validationError) throw new Error(validationError)

      const { error } = await supabase.auth.signUp({
=======
import { supabase } from '../../lib/supabase';

class AuthService {
  // =============== ĐĂNG KÝ ===============
  async register(userData) {
    try {
      // 1. Kiểm tra dữ liệu đầu vào
      const validationError = this.validateRegisterData(userData);
      if (validationError) throw new Error(validationError);

      // 2. Đăng ký tài khoản qua Supabase Auth
      // Supabase Auth sẽ tự động kiểm tra email trùng lặp
      const { data: authData, error: authError } = await supabase.auth.signUp({
>>>>>>> c96e419563bbbe5cf86eb774ba45544f0c8ed5d6
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name.trim(),
<<<<<<< HEAD
            phone: this.normalizePhone(userData.phone),
            role: userData.role,
            province: userData.province || null
=======
            role: userData.role || 'buyer',
            phone: this.normalizePhone(userData.phone)
>>>>>>> c96e419563bbbe5cf86eb774ba45544f0c8ed5d6
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

<<<<<<< HEAD
      if (error) throw error

      return {
        success: true,
        requiresConfirmation: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.'
      }

=======
      if (authError) throw this.handleAuthError(authError);

      /** * LƯU Ý: Không gọi createUserProfile thủ công ở đây nữa.
       * Database Trigger 'on_auth_user_created' sẽ tự động tạo dòng trong bảng profiles.
       */

      return {
        success: true,
        message: 'Đăng ký thành công! Hãy kiểm tra email để xác thực tài khoản.'
      };
>>>>>>> c96e419563bbbe5cf86eb774ba45544f0c8ed5d6
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  }

<<<<<<< HEAD
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
=======
  // =============== ĐĂNG NHẬP ===============
  async login(email, password) {
    try {
      if (!email || !password) throw new Error('Vui lòng nhập đầy đủ thông tin');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) throw this.handleAuthError(error);

      // Lấy Profile sau khi login thành công
      const profile = await this.getUserProfile(data.user.id);
>>>>>>> c96e419563bbbe5cf86eb774ba45544f0c8ed5d6

      return {
        success: true,
        user: data.user,
<<<<<<< HEAD
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
=======
        profile: profile,
        message: 'Chào mừng bạn quay trở lại!'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // =============== LẤY PROFILE ===============
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      return null;
    }
  }

  // =============== CẬP NHẬT PROFILE ===============
  async updateProfile(userId, updates) {
    try {
      // Loại bỏ email khỏi updates nếu có vì bảng profiles không có cột email
      const { email, ...validUpdates } = updates;

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...validUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // =============== VALIDATION & HELPER ===============
  validateRegisterData(data) {
    const { full_name, email, password, confirmPassword, role } = data;
    if (!full_name || full_name.length < 2) return 'Họ tên quá ngắn';
    if (!email || !email.includes('@')) return 'Email không hợp lệ';
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
    if (password.length < 8) return 'Mật khẩu phải từ 8 ký tự';
    if (!['farmer', 'buyer'].includes(role)) return 'Vai trò không hợp lệ';
    return null;
>>>>>>> c96e419563bbbe5cf86eb774ba45544f0c8ed5d6
  }

  normalizePhone(phone) {
    if (!phone) return '';
    return phone.replace(/\s/g, '').replace(/^0/, '+84');
  }

<<<<<<< HEAD
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
=======
  handleAuthError(error) {
    if (error.message.includes('User already registered')) return new Error('Email này đã tồn tại');
    if (error.message.includes('Invalid login credentials')) return new Error('Sai tài khoản hoặc mật khẩu');
    return error;
  }

  async logout() {
    await supabase.auth.signOut();
    return { success: true };
  }
}

export const authService = new AuthService();
>>>>>>> c96e419563bbbe5cf86eb774ba45544f0c8ed5d6
