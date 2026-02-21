'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import MultiUploadOCR from '@/components/MultiUploadOCR'
import type { Club } from '@/lib/types'

export default function AjouterFacturationPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [userId, setUserId] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
    supabase.from('clubs').select('*').then(r => setClubs(r.data ?? []))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajouter Factures VP</h1>
        <p className="text-sm text-gray-500">Factures émises vers clubs — OCR auto + commission 20%</p>
      </div>
      <MultiUploadOCR mode="facturation" clubs={clubs} userId={userId} />
    </div>
  )
}
