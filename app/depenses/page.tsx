'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import FactureTable from '@/components/FactureTable'
import type { FactureDepense } from '@/lib/types'

export default function DepensesPage() {
  const [rows, setRows] = useState<FactureDepense[]>([])

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('factures_depenses')
      .select('*, clubs(nom), types_depenses(nom,couleur)')
      .order('date_facture', { ascending: false })
    setRows(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dépenses Fournisseurs</h1>
      <FactureTable rows={rows} mode="depenses" onRefresh={load} />
    </div>
  )
}
