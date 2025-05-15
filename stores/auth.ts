import { defineStore } from 'pinia'
import { useSupabaseClient } from '#imports'

export interface AuthState {
  user: any | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSynced: string | null;
  syncInterval: string;
}

export const useAuth = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    syncStatus: 'idle',
    lastSynced: null,
    syncInterval: 'manual' // 'manual', '5min', '15min', '30min', '60min'
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isSyncing: (state) => state.syncStatus === 'syncing'
  },

  actions: {
    async initialize() {
      const supabase = useSupabaseClient()
      const { data } = await supabase.auth.getSession()
      this.session = data.session
      this.user = data.session?.user || null
      
      // 监听认证状态变化
      supabase.auth.onAuthStateChange((event, session) => {
        this.session = session
        this.user = session?.user || null
      })
    },

    async signUp(email: string, password: string) {
      this.loading = true
      this.error = null
      
      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        
        if (error) throw error
        
        this.user = data.user
        this.session = data.session
        
        // 初始同步
        if (data.user) {
          await this.initialSync()
        }
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async signIn(email: string, password: string) {
      this.loading = true
      this.error = null
      
      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        this.user = data.user
        this.session = data.session
        
        // 初始同步
        if (data.user) {
          await this.initialSync()
        }
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      // 先同步最新数据
      await this.syncData()
      
      const supabase = useSupabaseClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        this.error = error.message
      } else {
        this.user = null
        this.session = null
      }
    },

    async resetPassword(email: string) {
      this.loading = true
      this.error = null
      
      try {
        const supabase = useSupabaseClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        
        if (error) throw error
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async updatePassword(currentPassword: string, newPassword: string) {
      this.loading = true
      this.error = null
      
      try {
        const supabase = useSupabaseClient()
        
        // 先验证当前密码
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: this.user.email,
          password: currentPassword
        })
        
        if (signInError) throw signInError
        
        // 更新密码
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        })
        
        if (error) throw error
        
        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { error }
      } finally {
        this.loading = false
      }
    },

    async deleteAccount() {
      if (!this.user) return
      
      try {
        const supabase = useSupabaseClient()
        
        // 删除用户数据
        await supabase.from('user_settings').delete().eq('id', this.user.id)
        await supabase.from('focus_sessions').delete().eq('user_id', this.user.id)
        await supabase.from('tasks').delete().eq('user_id', this.user.id)
        await supabase.from('focus_goals').delete().eq('id', this.user.id)
        
        // 删除用户账户
        const { error } = await supabase.auth.admin.deleteUser(this.user.id)
        
        if (error) throw error
        
        // 清除本地状态
        this.user = null
        this.session = null
      } catch (error: any) {
        this.error = error.message
      }
    },

    async initialSync() {
      // 将在syncService中实现
      this.syncStatus = 'syncing'
      // 实现初始同步逻辑
      this.lastSynced = new Date().toISOString()
      this.syncStatus = 'idle'
    },

    async syncData() {
      // 将在syncService中实现
      this.syncStatus = 'syncing'
      // 实现数据同步逻辑
      this.lastSynced = new Date().toISOString()
      this.syncStatus = 'idle'
    }
  }
})
