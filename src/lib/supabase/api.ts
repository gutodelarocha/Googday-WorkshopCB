import { supabase } from './client'

/** Aligned with AuthScreen mock + Supabase Auth */
export const DEMO_USER = {
  email: 'email@email.com',
  password: 'teste123',
  id: 'a0000000-0000-4000-8000-000000000001',
  handle: 'marcos_v',
} as const

export type FeedPostRow = {
  post_id: string
  author_id: string
  author_name: string
  author_handle: string
  author_avatar: string | null
  body: string
  created_at: string
  likes_count: number
  comments_count: number
  media_urls: string[] | null
  tags: string[] | null
  reactions: { emoji: string; count: number }[] | null
  liked_by_me: boolean
  bookmarked_by_me: boolean
}

export type UiFeedPost = {
  id: string
  author: string
  avatar: string
  time: string
  text: string
  mention?: string
  tags: string[]
  image: string
  reactions: { emoji: string; count: number }[]
  likes: number
  comments: number
  liked: boolean
  bookmarked: boolean
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function mapFeedRow(row: FeedPostRow): UiFeedPost {
  const tags = (row.tags ?? []).map((t) => (t.startsWith('#') ? t : `#${t}`))
  const mentionMatch = row.body.match(/@([a-z0-9._]+)/i)
  return {
    id: row.post_id,
    author: row.author_handle.startsWith('@') ? row.author_handle : `@${row.author_handle}`,
    avatar: row.author_avatar || '',
    time: formatRelativeTime(row.created_at),
    text: row.body,
    mention: mentionMatch ? `@${mentionMatch[1]}` : undefined,
    tags,
    image: row.media_urls?.[0] || '',
    reactions: Array.isArray(row.reactions) ? row.reactions : [],
    likes: Number(row.likes_count) || 0,
    comments: Number(row.comments_count) || 0,
    liked: !!row.liked_by_me,
    bookmarked: !!row.bookmarked_by_me,
  }
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchHomeFeed(limit = 30, offset = 0): Promise<UiFeedPost[]> {
  const { data, error } = await supabase.rpc('get_home_feed', {
    p_limit: limit,
    p_offset: offset,
  })
  if (error) throw error
  return ((data as FeedPostRow[]) ?? []).map(mapFeedRow)
}

export async function fetchGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .is('deleted_at', null)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function fetchActiveStories() {
  const { data, error } = await supabase
    .from('stories')
    .select(
      `
      id,
      author_id,
      status,
      expires_at,
      created_at,
      users:author_id ( id, name, handle, avatar_url ),
      media ( id, url, type )
    `,
    )
    .eq('status', 'ACTIVE')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchNotifications() {
  const { data, error } = await supabase.rpc('get_notifications' as any)
  if (error) {
    const { data: data2, error: error2 } = await supabase
      .from('notifications')
      .select(
        `
      id,
      type,
      body,
      is_read,
      created_at,
      post_id,
      group_id,
      actor:actor_id ( id, name, handle, avatar_url )
    `,
      )
      .order('created_at', { ascending: false })
      .limit(50)
    if (error2) throw error2
    return data2 ?? []
  }
  return data ?? []
}

export async function searchGooday(query: string, limit = 20) {
  const { data, error } = await supabase.rpc('search_gooday', {
    p_query: query,
    p_limit: limit,
  })
  if (error) throw error
  return data
}

export async function toggleFollow(userId: string) {
  const { data, error } = await supabase.rpc('toggle_follow', { p_target: userId })
  if (error) throw error
  return data as { following: boolean }
}

export async function toggleLikePost(postId: string) {
  const { data, error } = await supabase.rpc('toggle_like_post', { p_post_id: postId })
  if (error) throw error
  return data as { liked: boolean }
}

export async function toggleBookmark(postId: string) {
  const { data, error } = await supabase.rpc('toggle_bookmark', { p_post_id: postId })
  if (error) throw error
  return data as { bookmarked: boolean }
}

export async function toggleReaction(postId: string, emoji: string) {
  const { data, error } = await supabase.rpc('toggle_reaction', {
    p_post_id: postId,
    p_emoji: emoji,
  })
  if (error) throw error
  return data as { reacted: boolean; emoji: string }
}

export async function createComment(postId: string, body: string, parentId?: string) {
  const { data, error } = await supabase.rpc('create_comment', {
    p_post_id: postId,
    p_body: body,
    p_parent_id: parentId ?? null,
  })
  if (error) throw error
  return data as string
}

export async function uploadMedia(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Faça login para enviar mídia')

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  })
  if (error) throw error

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

export async function createPost(input: {
  body: string
  audience?: 'PUBLIC' | 'FOLLOWERS' | 'GROUP'
  groupId?: string | null
  mediaUrls?: string[]
  tags?: string[]
  mentionHandles?: string[]
}) {
  let groupId = input.groupId ?? null
  if (groupId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId)) {
    const { data: group } = await supabase
      .from('groups')
      .select('id')
      .eq('slug', groupId)
      .maybeSingle()
    groupId = group?.id ?? null
  }

  const { data, error } = await supabase.rpc('create_post', {
    p_body: input.body,
    p_audience: groupId ? 'GROUP' : (input.audience ?? 'PUBLIC'),
    p_group_id: groupId,
    p_media_urls: input.mediaUrls ?? [],
    p_tags: input.tags ?? [],
    p_mention_handles: input.mentionHandles ?? [],
  })
  if (error) throw error
  return data as string
}

export async function createStory(mediaUrl: string, mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE') {
  const { data, error } = await supabase.rpc('create_story', {
    p_media_url: mediaUrl,
    p_media_type: mediaType,
  })
  if (error) throw error
  return data as string
}

export function extractTags(text: string): string[] {
  const matches = text.match(/#[\p{L}\p{N}_]+/gu) ?? []
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))]
}

export function extractMentions(text: string): string[] {
  const matches = text.match(/@([a-z0-9._]+)/gi) ?? []
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))]
}
