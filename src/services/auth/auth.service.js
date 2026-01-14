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
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name.trim(),
            role: userData.role || 'buyer',
            phone: this.normalizePhone(userData.phone)
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw this.handleAuthError(authError);

      /** * LƯU Ý: Không gọi createUserProfile thủ công ở đây nữa.
       * Database Trigger 'on_auth_user_created' sẽ tự động tạo dòng trong bảng profiles.
       */

      return {
        success: true,
        message: 'Đăng ký thành công! Hãy kiểm tra email để xác thực tài khoản.'
      };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  }

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

      return {
        success: true,
        user: data.user,
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
  }

  normalizePhone(phone) {
    if (!phone) return '';
    return phone.replace(/\s/g, '').replace(/^0/, '+84');
  }

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