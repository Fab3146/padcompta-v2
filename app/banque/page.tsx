'use client'
import { useState } from 'react'
import { read, utils } from 'xlsx'
import { toast } from 'sonner'
import { Landmark, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BankRow = { date: string; description: string; amount: number; matched: boolean }

export default function BanquePage() {
  const [rows, setRows] = useState<BankRow[]>([])

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.split('\n').filter(Boolean)
    const parsed: BankRow[] = lines.slice(1).map(line => {
      const cols = line.split(';')
      return {
        date: cols[0]?.trim() ?? '',
        description: cols[2]?.trim() ?? '',
        amount: parseFloat((cols[3] ?? '0').replace(',', '.')),
        matched: false,
      }
    }).filter(r => r.date)
    setRows(parsed)
    toast.success(`${parsed.length} transactions Revolut importées`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Landmark className="w-6 h-6" /> Banque Revolut
      </h1>
      <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center bg-indigo-50">
        <p className="text-sm font-medium text-indigo-700">Uploadez votre CSV Revolut</p>
        <label className="mt-4 inline-block">
          <Button variant="outline" asChild><span><Upload className="w-4 h-4 mr-2" />Choisir CSV</span></Button>
          <input type="file" accept=".csv" className="hidden" onChange={onFile} />
        </label>
      </div>
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Date','Description','Montant','Statut'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{r.date}</td>
                  <td className="px-4 py-3 text-gray-900">{r.description}</td>
                  <td className={`px-4 py-3 font-mono font-medium ${r.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {r.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.matched ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {r.matched ? '✅ Rapproché' : 'Non rapproché'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
