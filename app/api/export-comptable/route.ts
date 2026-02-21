import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'

export async function GET() {
  // Fetch non-exported invoices
  const { data: depenses } = await supabaseAdmin
    .from('factures_depenses')
    .select('*, clubs(nom), types_depenses(nom)')
    .in('statut', ['a_envoyer_compta', 'a_payer'])

  const rows = (depenses ?? []).map(d => ({
    'N° Facture': d.numero_facture ?? '',
    'Club': (d as any).clubs?.nom ?? '',
    'Entreprise': d.entreprise ?? '',
    'Type': (d as any).types_depenses?.nom ?? '',
    'Date': d.date_facture ?? '',
    'HT (€)': d.ht ?? 0,
    'TVA (€)': d.tva ?? 0,
    'TTC (€)': d.ttc ?? 0,
    'TVA Récupérable': d.tva_recuperable ? 'Oui' : 'Non',
    'Statut': d.statut ?? '',
    'Commentaire': d.commentaire ?? '',
  }))

  const tvaRows = (depenses ?? [])
    .filter(d => d.tva_recuperable)
    .map(d => ({
      'N° Facture': d.numero_facture ?? '',
      'Entreprise': d.entreprise ?? '',
      'Date': d.date_facture ?? '',
      'TVA Récupérable (€)': d.tva ?? 0,
    }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Dépenses')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tvaRows), 'Déclaration TVA')

  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  // Build ZIP
  const zip = new JSZip()
  zip.file('export_compta.xlsx', excelBuffer)
  zip.file('README.txt', `Export comptable généré le ${new Date().toLocaleDateString('fr-FR')}\n${rows.length} factures incluses.`)

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

  // Mark as sent
  const ids = (depenses ?? []).map(d => d.id)
  if (ids.length > 0) {
    await supabaseAdmin
      .from('factures_depenses')
      .update({ statut: 'envoyee_compta' })
      .in('id', ids)
  }

  const fileName = `compta_${new Date().toISOString().slice(0,10)}.zip`
  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${fileName}`,
    },
  })
}
