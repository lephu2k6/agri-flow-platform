import { supabase } from '../../lib/supabase'

export class SocialAuthService {
  static async loginWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) throw error
      return { success: true, data }

    } catch (error) {
      console.error('Google login error:', error)
      return { 
        success: false, 
        error: 'Không thể đăng nhập với Google' 
      }
    }
  }

  static async loginWithFacebook() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return { success: true, data }

    } catch (error) {
      console.error('Facebook login error:', error)
      return { 
        success: false, 
        error: 'Không thể đăng nhập với Facebook' 
      }
    }
  }

  static async loginWithGithub() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return { success: true, data }

    } catch (error) {
      console.error('GitHub login error:', error)
      return { 
        success: false, 
        error: 'Không thể đăng nhập với GitHub' 
      }
    }
  }

  static async handleSocialLoginCallback() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (session?.user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Create profile if doesn't exist
        if (!profile) {
          await this.createProfileFromSocialLogin(session.user)
        }

        return { 
          success: true, 
          user: session.user, 
          profile: profile 
        }
      }

      return { success: false, error: 'No session found' }

    } catch (error) {
      console.error('Social login callback error:', error)
      return { success: false, error: error.message }
    }
  }

  static async createProfileFromSocialLogin(authUser) {
    try {
      const userMeta = authUser.user_metadata || {}
      
      const profileData = {
        id: authUser.id,
        full_name: userMeta.full_name || 
                  userMeta.name || 
                  authUser.email?.split('@')[0] || 
                  'User',
        phone: userMeta.phone || '',
        role: 'buyer', // Default role for social login
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
      console.error('Create profile from social login error:', error)
      return null
    }
  }
}