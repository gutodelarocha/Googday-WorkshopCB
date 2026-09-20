export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Privacy = 'PUBLIC' | 'PRIVATE'
export type GroupMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER'
export type GroupMemberStatus = 'ACTIVE' | 'PENDING' | 'BANNED'
export type NotificationType =
  | 'FOLLOW'
  | 'LIKE'
  | 'COMMENT'
  | 'MENTION'
  | 'GROUP_INVITE'
  | 'GROUP_REQUEST'
  | 'GROUP_ACCEPTED'
  | 'MESSAGE'
  | 'STORY_REPLY'
  | 'POST_SHARE'
export type MediaType = 'IMAGE' | 'VIDEO'
export type PostAudience = 'PUBLIC' | 'FOLLOWERS' | 'GROUP'
export type StoryStatus = 'ACTIVE' | 'EXPIRED' | 'DELETED'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          handle: string
          avatar_url: string | null
          cover_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          phone: string | null
          is_verified: boolean
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']> & {
          id: string
          name: string
          handle: string
        }
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      posts: {
        Row: {
          id: string
          author_id: string
          body: string
          audience: PostAudience
          location_name: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['posts']['Row']> & {
          author_id: string
        }
        Update: Partial<Database['public']['Tables']['posts']['Row']>
      }
      groups: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          cover_url: string | null
          avatar_url: string | null
          privacy: Privacy
          parent_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['groups']['Row']> & {
          slug: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['groups']['Row']>
      }
      stories: {
        Row: {
          id: string
          author_id: string
          status: StoryStatus
          expires_at: string
          created_at: string
          deleted_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['stories']['Row']> & {
          author_id: string
        }
        Update: Partial<Database['public']['Tables']['stories']['Row']>
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          actor_id: string | null
          type: NotificationType
          post_id: string | null
          comment_id: string | null
          group_id: string | null
          body: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          recipient_id: string
          type: NotificationType
        }
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: {
      get_home_feed: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          post_id: string
          author_id: string
          author_name: string
          author_handle: string
          author_avatar: string | null
          body: string
          created_at: string
          likes_count: number
          comments_count: number
          media_urls: string[]
          tags: string[]
          reactions: Json
        }[]
      }
      search_gooday: {
        Args: { p_query: string; p_limit?: number }
        Returns: Json
      }
      toggle_follow: { Args: { p_target: string }; Returns: Json }
      toggle_like_post: { Args: { p_post_id: string }; Returns: Json }
      toggle_bookmark: { Args: { p_post_id: string }; Returns: Json }
      toggle_reaction: {
        Args: { p_post_id: string; p_emoji: string }
        Returns: Json
      }
      join_group: { Args: { p_group_id: string }; Returns: Json }
      get_or_create_dm: { Args: { p_other_user_id: string }; Returns: string }
      create_post: {
        Args: {
          p_body: string
          p_audience?: PostAudience
          p_group_id?: string | null
          p_media_urls?: string[]
          p_tags?: string[]
          p_mention_handles?: string[]
        }
        Returns: string
      }
      create_story: {
        Args: { p_media_url: string; p_media_type?: MediaType }
        Returns: string
      }
      mark_notifications_read: {
        Args: { p_ids?: string[] | null }
        Returns: number
      }
    }
    Enums: {
      privacy: Privacy
      group_member_role: GroupMemberRole
      group_member_status: GroupMemberStatus
      notification_type: NotificationType
      media_type: MediaType
      post_audience: PostAudience
      story_status: StoryStatus
    }
  }
}
