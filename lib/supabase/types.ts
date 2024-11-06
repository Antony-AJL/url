export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      domains: {
        Row: {
          id: string
          created_at: string
          user_id: string
          domain: string
          verification_method: 'dns' | 'file'
          verification_token: string
          verification_status: 'pending' | 'verified' | 'failed'
          last_verified_at: string | null
          last_health_check: string | null
          is_healthy: boolean
          settings: {
            auto_sitemap_sync: boolean
            sitemap_urls: string[]
            auto_indexing: boolean
            indexing_frequency: 'daily' | 'weekly' | 'monthly'
          }
        }
        Insert: Omit<domains['Row'], 'id' | 'created_at'>
        Update: Partial<domains['Row']>
      }
      domain_health_logs: {
        Row: {
          id: string
          created_at: string
          domain_id: string
          status_code: number
          response_time: number
          is_healthy: boolean
          error_message: string | null
        }
      }
    }
  }
}