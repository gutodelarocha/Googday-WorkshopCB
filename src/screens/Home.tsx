import { useCallback, useEffect, useState } from 'react'
import {
  BottomNav,
  ContextRail,
  GroupCard,
  MobileHeader,
  PostCard,
  SidebarNav,
  StoriesRow,
  TopBar,
} from '../components/home'
import Notifications from '../components/Notifications'
import { currentUser, groups, posts as mockPosts, stories } from '../lib/media'
import {
  fetchHomeFeed,
  toggleBookmark,
  toggleLikePost,
  type UiFeedPost,
} from '../lib/supabase'

function mockToFeed(): UiFeedPost[] {
  return mockPosts.map((p, i) => ({
    id: `mock-${i}`,
    author: p.author,
    avatar: p.avatar,
    time: p.time,
    text: p.text,
    mention: p.mention,
    tags: p.tags,
    image: p.image,
    reactions: p.reactions,
    likes: p.likes,
    comments: p.comments,
    liked: false,
    bookmarked: false,
  }))
}

export default function Home({
  onNavigate,
  activeKey,
  onOpenGroup,
}: {
  onNavigate?: (key: string) => void
  activeKey?: string
  onOpenGroup?: (id: string) => void
}) {
  const [showNotifs, setShowNotifs] = useState(false)
  const [feed, setFeed] = useState<UiFeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFeed = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchHomeFeed(40)
      setFeed(rows.length > 0 ? rows : mockToFeed())
    } catch (err) {
      console.warn('[Gooday] feed fallback to mocks', err)
      setFeed(mockToFeed())
      setError(err instanceof Error ? err.message : 'Falha ao carregar feed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadFeed()
  }, [loadFeed])

  const handleLike = async (postId: string) => {
    if (postId.startsWith('mock-')) return
    setFeed((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1,
            }
          : p,
      ),
    )
    try {
      await toggleLikePost(postId)
    } catch (err) {
      console.error(err)
      void loadFeed()
    }
  }

  const handleBookmark = async (postId: string) => {
    if (postId.startsWith('mock-')) return
    setFeed((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p)),
    )
    try {
      await toggleBookmark(postId)
    } catch (err) {
      console.error(err)
      void loadFeed()
    }
  }

  return (
    <div className="min-h-dvh w-full bg-canvas pb-28 min-[800px]:pb-0">
      <TopBar user={currentUser} onNavigate={onNavigate} onNotifications={() => setShowNotifs(true)} />
      <MobileHeader user={currentUser} onNotifications={() => setShowNotifs(true)} onNavigate={onNavigate} />
      {showNotifs && <Notifications onClose={() => setShowNotifs(false)} />}

      <div className="w-full px-5 min-[1800px]:px-8">
        <section className="py-4">
          <StoriesRow stories={stories} />
        </section>

        <section className="min-[800px]:hidden">
          <h2 className="mb-3 px-0.5 text-[16px] font-semibold text-ink">Grupos para você</h2>
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
            {groups.map((g) => (
              <div key={g.id} className="w-[190px] shrink-0 sm:w-[220px]">
                <GroupCard group={g} onOpenGroup={onOpenGroup} />
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 py-5 min-[800px]:grid-cols-[max-content_minmax(280px,560px)_minmax(240px,1fr)] min-[1200px]:gap-10 min-[1800px]:gap-12">
          <aside className="hidden min-[800px]:block">
            <div className="sticky top-[68px]">
              <SidebarNav activeKey={activeKey} onNavigate={onNavigate} />
            </div>
          </aside>

          <main className="mx-auto w-full max-w-[640px] space-y-5 min-[800px]:mx-0 min-[800px]:max-w-none">
            {loading && (
              <p className="rounded-xl bg-surface px-4 py-6 text-center text-[14px] text-neutral-500">
                Carregando feed…
              </p>
            )}
            {!loading &&
              feed.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onLike={() => void handleLike(p.id)}
                  onBookmark={() => void handleBookmark(p.id)}
                />
              ))}
            {error && !loading && (
              <p className="text-center text-[12px] text-neutral-400">Usando cache local · {error}</p>
            )}
          </main>

          <aside className="hidden min-[800px]:block">
            <div
              className="sticky top-[68px] overflow-y-auto"
              style={{
                maxHeight: 'calc(100dvh - 68px)',
                maskImage:
                  'linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)',
                scrollbarWidth: 'none',
              }}
            >
              <div className="py-6">
                <ContextRail groups={groups} onOpenGroup={onOpenGroup} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <BottomNav activeKey={activeKey} onNavigate={onNavigate} />
    </div>
  )
}
