'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Download, FileSpreadsheet, Package, Loader2 } from 'lucide-react'

export default function ExportsPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const doExport = async (endpoint: string, label: string) => {
    setLoading(endpoint)
    try {
      const res = await fetch(`/api/${endpoint}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')?.split('filename=')[1] ?? `export_${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${label} téléchargé !`)
    } catch {
      toast.error('Erreur export')
    }
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Exports Comptables</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Package className="w-5 h-5" /> Export Comptable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Exporte uniquement les factures <strong>non encore envoyées</strong> à la comptabilité.
              Génère un ZIP (Excel + PDFs) et marque automatiquement les lignes <em>envoyee_compta</em>.
            </p>
            <ul className="text-xs text-gray-500 space-y-1 list-disc ml-4">
              <li>Excel : HT / TVA / TTC / Club / Statut</li>
              <li>ZIP : PDFs des factures concernées</li>
              <li>Feuille dédiée Déclaration TVA</li>
            </ul>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={() => doExport('export-comptable', 'Export comptable')}
              disabled={!!loading}
            >
              {loading === 'export-comptable'
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Export en cours...</>
                : <><Download className="w-4 h-4 mr-2" />Télécharger ZIP Compta</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FileSpreadsheet className="w-5 h-5" /> Export Total
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Export historique complet de toutes les factures (dépenses + émises).
              Excel filtrable par période, club et type.
            </p>
            <ul className="text-xs text-gray-500 space-y-1 list-disc ml-4">
              <li>Toutes périodes confondues</li>
              <li>Onglet Dépenses + Onglet Facturation VP</li>
              <li>Onglet Audit (modifications)</li>
            </ul>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => doExport('export-total', 'Export total')}
              disabled={!!loading}
            >
              {loading === 'export-total'
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Export en cours...</>
                : <><FileSpreadsheet className="w-4 h-4 mr-2" />Télécharger Excel Complet</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
