import { useState } from 'react'
import { ChevronLeft, Users, Lock, Globe, Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react'

// Temporary stub — full GroupProfile content will replace this in next commit
export default function GroupProfile({ groupId, onBack }: { groupId: string; onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-canvas">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-surface px-4 py-3 border-b border-neutral-200">
        <button onClick={onBack} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-neutral-100">
          <ChevronLeft size={22} />
        </button>
        <span className="flex-1 text-[17px] font-semibold text-ink">Grupo</span>
      </header>
      <div className="p-5 text-neutral-500">Carregando grupo {groupId}…</div>
    </div>
  )
}
