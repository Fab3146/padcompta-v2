'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import MultiUploadOCR from '@/components/MultiUploadOCR'
import type { Club, TypeDepense } from '@/lib/types'

export default function AjouterDepensesPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [types, setTypes] = useState<TypeDepense[]>([])
  const [userId, setUserId] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
    supabase.from('clubs').select('*').then(r => setClubs(r.data ?? []))
    supabase.from('types_depenses').select('*').then(r => setTypes(r.data ?? []))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter Dépenses</h1>
        <p className="text-sm text-gray-500">Upload multi-fichiers avec OCR automatique</p>
      </div>
      <MultiUploadOCR mode="depenses" clubs={clubs} types={types} userId={userId} />
    </div>
  )
}
