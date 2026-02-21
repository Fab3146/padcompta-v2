'use client'
import { useState } from 'react'
import { read, utils } from 'xlsx'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { FileSpreadsheet, Upload, Loader2 } from 'lucide-react'

export default function ImportExcelPage() {
  const [preview, setPreview] = useState<Record<string,any>[]>([])
  const [importing, setImporting] = useState(false)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const buf = await file.arrayBuffer()
    const wb = read(buf)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const json = utils.sheet_to_json<Record<string,any>>(ws)
    setPreview(json.slice(0, 5))
    toast.info(`${json.length} lignes détectées`)
  }

  const doImport = async () => {
    if (!preview.length) return
    setImporting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const rows = preview.map(r => ({
      user_id: user?.id,
      entreprise: r['Entreprise'] ?? r['entreprise'] ?? null,
      numero_facture: r['N° Facture'] ?? r['numero_facture'] ?? null,
      date_facture: r['Date'] ?? r['date_facture'] ?? null,
      ht: parseFloat(r['HT'] ?? r['ht'] ?? 0) || null,
      tva: parseFloat(r['TVA'] ?? r['tva'] ?? 0) || null,
      ttc: parseFloat(r['TTC'] ?? r['ttc'] ?? 0) || null,
      statut: 'a_payer',
    }))
    const { error } = await supabase.from('factures_depenses').insert(rows as any)
    if (error) toast.error('Erreur import : ' + error.message)
    else toast.success(`✅ ${rows.length} lignes importées !`)
    setImporting(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Import Excel</h1>
      <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center bg-green-50">
        <FileSpreadsheet className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="text-sm font-medium text-green-700">Uploadez votre fichier .xlsx existant</p>
        <p className="text-xs text-green-500 mt-1">Colonnes détectées auto : Entreprise, HT, TVA, TTC, Date, N° Facture</p>
        <label className="mt-4 inline-block">
          <Button variant="outline" className="cursor-pointer" asChild>
            <span><Upload className="w-4 h-4 mr-2" />Choisir fichier</span>
          </Button>
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
        </label>
      </div>

      {preview.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Aperçu (5 premières lignes) :</p>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>{Object.keys(preview[0]).map(k => <th key={k} className="px-3 py-2 text-left font-medium text-gray-600">{k}</th>)}</tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {Object.values(row).map((v, j) => <td key={j} className="px-3 py-2 text-gray-700">{String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={doImport} disabled={importing}>
            {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Import...</> : <><FileSpreadsheet className="w-4 h-4 mr-2" />Importer tout</>}
          </Button>
        </div>
      )}
    </div>
  )
}
