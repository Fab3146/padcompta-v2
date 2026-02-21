'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import FactureTable from '@/components/FactureTable'
import type { FactureEmise } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

export default function FacturationPage() {
  const [rows, setRows] = useState<FactureEmise[]>([])

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('factures_emises')
      .select('*, clubs(nom)')
      .order('date_facture', { ascending: false })
    setRows(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const retard = rows.filter(r =>
    r.statut_paiement !== 'payee' &&
    r.date_paiement_prevue &&
    new Date(r.date_paiement_prevue) < new Date()
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Facturation VP</h1>
      {retard.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>⚠️ {retard.length} facture(s) en retard de paiement — {retard.map(r => r.clubs?.nom ?? r.numero_facture).join(', ')}</span>
        </div>
      )}
      <FactureTable rows={rows} mode="facturation" onRefresh={load} />
    </div>
  )
}

