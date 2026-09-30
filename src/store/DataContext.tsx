import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { MediaItem, Note, Tag, TodoItem } from '../lib/types'
import { useAuth } from '../hooks/AuthContext'
import { useToast } from '../components/ui'

export type NoteInput = {
  id?: string
  kind: 'note' | 'todo'
  title: string
  content: string | null
  items: TodoItem[] | null
  due_at: string | null
  tag_ids: string[]
}

export type MediaInput = {
  url: string
  provider: string
  title: string | null
  thumbnail_url: string | null
  tag_ids: string[]
}

type DataCtx = {
  loading: boolean
  tags: Tag[]
  notes: Note[]
  media: MediaItem[]
  createTag: (name: string, color: string) => Promise<Tag | null>
  deleteTag: (id: string) => Promise<void>
  upsertNote: (input: NoteInput) => Promise<Note | null>
  deleteNote: (id: string) => Promise<void>
  toggleTodo: (noteId: string, itemId: string) => Promise<void>
  saveMedia: (input: MediaInput) => Promise<MediaItem | null>
  deleteMedia: (id: string) => Promise<void>
}

const Ctx = createContext<DataCtx | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const { session } = useAuth()
  const uid = session?.user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState<Tag[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])

  const load = useCallback(async () => {
    if (!uid) return
    setLoading(true)
    const [t, n, m] = await Promise.all([
      supabase!.from('tags').select('*').order('created_at', { ascending: true }),
      supabase!.from('notes').select('*').order('updated_at', { ascending: false }),
      supabase!.from('media_items').select('*').order('created_at', { ascending: false }),
    ])
    if (t.error || n.error || m.error) {
      toast('Não foi possível carregar seus dados. Você rodou o supabase/schema.sql?', 'error')
    } else {
      setTags((t.data ?? []) as Tag[])
      setNotes((n.data ?? []) as Note[])
      setMedia((m.data ?? []) as MediaItem[])
    }
    setLoading(false)
  }, [uid, toast])

  useEffect(() => {
    load()
  }, [load])

  const createTag = useCallback(
    async (name: string, color: string): Promise<Tag | null> => {
      if (!uid) return null
      const { data, error } = await supabase!
        .from('tags')
        .insert({ user_id: uid, name: name.trim(), color })
        .select()
        .single()
      if (error) {
        toast(
          /duplicate/i.test(error.message)
            ? 'Já existe uma etiqueta com esse nome.'
            : 'Não foi possível criar a etiqueta.',
          'error',
        )
        return null
      }
      const tag = data as Tag
      setTags((s) => [...s, tag])
      return tag
    },
    [uid, toast],
  )

  const deleteTag = useCallback(
    async (id: string) => {
      setTags((s) => s.filter((t) => t.id !== id))
      const { error } = await supabase!.from('tags').delete().eq('id', id)
      if (error) {
        toast('Não foi possível excluir a etiqueta.', 'error')
        load()
      }
    },
    [load, toast],
  )

  const upsertNote = useCallback(
    async (input: NoteInput): Promise<Note | null> => {
      if (!uid) return null
      const payload = {
        kind: input.kind,
        title: input.title,
        content: input.content,
        items: input.items,
        due_at: input.due_at,
        tag_ids: input.tag_ids,
        updated_at: new Date().toISOString(),
      }
      const { data, error } = input.id
        ? await supabase!.from('notes').update(payload).eq('id', input.id).select().single()
        : await supabase!.from('notes').insert({ ...payload, user_id: uid }).select().single()
      if (error) {
        toast('Não foi possível salvar a nota.', 'error')
        return null
      }
      const note = data as Note
      setNotes((s) => [note, ...s.filter((x) => x.id !== note.id)])
      return note
    },
    [uid, toast],
  )

  const deleteNote = useCallback(
    async (id: string) => {
      setNotes((s) => s.filter((n) => n.id !== id))
      const { error } = await supabase!.from('notes').delete().eq('id', id)
      if (error) {
        toast('Não foi possível excluir a nota.', 'error')
        load()
      }
    },
    [load, toast],
  )

  const toggleTodo = useCallback(
    async (noteId: string, itemId: string) => {
      const note = notes.find((n) => n.id === noteId)
      if (!note?.items) return
      const items = note.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i))
      // Atualização otimista: o check aparece na hora; rollback se falhar.
      setNotes((s) => s.map((n) => (n.id === noteId ? { ...n, items } : n)))
      const { error } = await supabase!
        .from('notes')
        .update({ items, updated_at: new Date().toISOString() })
        .eq('id', noteId)
      if (error) {
        setNotes((s) => s.map((n) => (n.id === noteId ? { ...n, items: note.items! } : n)))
        toast('Sem conexão — a alteração foi desfeita.', 'error')
      }
    },
    [notes, toast],
  )

  const saveMedia = useCallback(
    async (input: MediaInput): Promise<MediaItem | null> => {
      if (!uid) return null
      const { data, error } = await supabase!
        .from('media_items')
        .insert({
          user_id: uid,
          url: input.url,
          provider: input.provider,
          title: input.title,
          thumbnail_url: input.thumbnail_url,
          tag_ids: input.tag_ids,
        })
        .select()
        .single()
      if (error) {
        toast('Não foi possível salvar o link.', 'error')
        return null
      }
      const item = data as MediaItem
      setMedia((s) => [item, ...s])
      return item
    },
    [uid, toast],
  )

  const deleteMedia = useCallback(
    async (id: string) => {
      setMedia((s) => s.filter((m) => m.id !== id))
      const { error } = await supabase!.from('media_items').delete().eq('id', id)
      if (error) {
        toast('Não foi possível excluir o link.', 'error')
        load()
      }
    },
    [load, toast],
  )

  const value = useMemo(
    () => ({
      loading,
      tags,
      notes,
      media,
      createTag,
      deleteTag,
      upsertNote,
      deleteNote,
      toggleTodo,
      saveMedia,
      deleteMedia,
    }),
    [loading, tags, notes, media, createTag, deleteTag, upsertNote, deleteNote, toggleTodo, saveMedia, deleteMedia],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useData() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useData precisa estar dentro de <DataProvider>')
  return ctx
}
