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
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          published: boolean
          created_at: string
          featured_image?: string | null
          view_count: number
          tags?: string[] | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt: string
          content: string
          published?: boolean
          created_at?: string
          featured_image?: string | null
          view_count?: number
          tags?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          published?: boolean
          created_at?: string
          featured_image?: string | null
          view_count?: number
          tags?: string[] | null
        }
      }
      site_stats: {
        Row: {
          id: number
          total_visitors: number
          updated_at: string
        }
        Insert: {
          id?: number
          total_visitors?: number
          updated_at?: string
        }
        Update: {
          id?: number
          total_visitors?: number
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          parent_id: string | null
          name: string
          email: string
          comment: string
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          parent_id?: string | null
          name: string
          email: string
          comment: string
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          parent_id?: string | null
          name?: string
          email?: string
          comment?: string
          approved?: boolean
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          post_id?: string
          created_at?: string
        }
      },
      settings: {
        Row: {
          key: string
          value: string
          created_at: string
        }
        Insert: {
          key: string
          value: string
          created_at?: string
        }
        Update: {
          key?: string
          value?: string
          created_at?: string
        }
      },
      polls: {
        Row: {
          id: string
          post_id: string
          question: string
          options: Json
          placement: 'top' | 'bottom' | 'middle'
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          question: string
          options: Json
          placement?: 'top' | 'bottom' | 'middle'
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          question?: string
          options?: Json
          placement?: 'top' | 'bottom' | 'middle'
          created_at?: string
        }
      },
      poll_votes: {
        Row: {
          id: string
          poll_id: string
          user_id: string
          option_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          user_id: string
          option_id: string
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          user_id?: string
          option_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_poll_voter_avatars: {
        Args: {
          p_poll_id: string
        }
        Returns: {
          avatar_url: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
