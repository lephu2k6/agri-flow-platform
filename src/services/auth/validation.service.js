export class ValidationService {
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  static validatePhone(phone) {
    const cleaned = phone.replace(/\s/g, '')
    const regex = /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/
    return regex.test(cleaned)
  }

  static validatePassword(password) {
    const errors = []
    
    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường')
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 số')
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  static calculatePasswordStrength(password) {
    let score = 0
    
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    return Math.min(score, 4) // Max score is 4 for UI
  }

  static validateFullName(name) {
    return name.trim().length >= 2
  }

  static validateProvince(province) {
    return province && province.trim().length > 0
  }

  static normalizePhone(phone) {
    let cleaned = phone.replace(/\s/g, '')
    
    if (cleaned.startsWith('0')) {
      cleaned = '+84' + cleaned.substring(1)
    } else if (!cleaned.startsWith('+84')) {
      cleaned = '+84' + cleaned
    }
    
    return cleaned
  }
}