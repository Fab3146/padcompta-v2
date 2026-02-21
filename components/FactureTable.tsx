'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatEuro, formatDate, STATUT_LABELS, STATUT_COLORS } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { FactureDepense, FactureEmise } from '@/lib/types'
import { Pencil, Trash2, Check, X } from 'lucide-react'

type Mode = 'depenses' | 'facturation'
type Row = FactureDepense | FactureEmise

interface Props {
  rows: Row[]
  mode: Mode
  onRefresh: () => void
}

export default function FactureTable({ rows, mode, onRefresh }: Props) {
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Row>>({})
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')

  const table = mode === 'depenses' ? 'factures_depenses' : 'factures_emises'
  const statutKey = mode === 'depenses' ? 'statut' : 'statut_paiement'

  const filtered = rows.filter(r => {
    const text = JSON.stringify(r).toLowerCase()
    const matchSearch = !search || text.includes(search.toLowerCase())
    const matchStatut = !filterStatut || (r as any)[statutKey] === filterStatut
    return matchSearch && matchStatut
  })

  const totalHT = filtered.reduce((s, r) => s + ((r as any).ht ?? 0), 0)
  const totalTVA = filtered.reduce((s, r) => s + ((r as any).tva ?? 0), 0)
  const totalTTC = filtered.reduce((s, r) => s + ((r as any).ttc ?? 0), 0)

  const startEdit = (row: Row) => {
    setEditId(row.id)
    setEditData({ ...row })
  }

  const saveEdit = async () => {
    if (!editId) return
    const { error } = await supabase.from(table as any)
      .update({ ...editData, updated_at: new Date().toISOString() })
      .eq('id', editId)
    if (error) toast.error('Erreur sauvegarde')
    else { toast.success('Modifié !'); setEditId(null); onRefresh() }
  }

  const deleteRow = async (id: string) => {
    if (!confirm('Supprimer ?')) return
    await supabase.from(table as any).delete().eq('id', id)
    toast.success('Supprimé')
    onRefresh()
  }

  const statuts = mode === 'depenses'
    ? ['a_payer','payee','a_envoyer_compta','envoyee_compta','tva_recuperee']
    : ['a_payer','payee_partielle','payee','impayee']

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-48" />
        <Select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="w-44">
          <option value="">Tous statuts</option>
          {statuts.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b text-xs">
            <tr>
              {['Club','Entreprise/N°','Date','HT','TVA','TTC','Statut','Actions']
                .map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const r = row as any
              const isEdit = editId === row.id
              return (
                <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{r.clubs?.nom ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.entreprise || r.numero_facture || '—'}</div>
                    {r.entreprise && <div className="text-xs text-gray-400">{r.numero_facture}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(r.date_facture)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {isEdit ? (
                      <Input className="h-7 w-24 text-xs" type="number" value={(editData as any).ht ?? ''} onChange={e => setEditData(p => ({ ...p, ht: parseFloat(e.target.value) }))} />
                    ) : formatEuro(r.ht)}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500">{formatEuro(r.tva)}</td>
                  <td className="px-4 py-3 font-mono font-semibold">{formatEuro(r.ttc)}</td>
                  <td className="px-4 py-3">
                    {isEdit ? (
                      <Select className="h-7 text-xs w-36" value={(editData as any)[statutKey] ?? ''} onChange={e => setEditData(p => ({ ...p, [statutKey]: e.target.value }))}>
                        {statuts.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
                      </Select>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[r[statutKey]] ?? ''}`}>
                        {STATUT_LABELS[r[statutKey]] ?? r[statutKey]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {isEdit ? (
                        <>
                          <button onClick={saveEdit} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(row)} className="text-blue-500 hover:text-blue-700"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteRow(row.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t font-semibold text-sm">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-gray-600">TOTAUX ({filtered.length} lignes)</td>
              <td className="px-4 py-2 font-mono">{formatEuro(totalHT)}</td>
              <td className="px-4 py-2 font-mono text-gray-500">{formatEuro(totalTVA)}</td>
              <td className="px-4 py-2 font-mono text-blue-700">{formatEuro(totalTTC)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
