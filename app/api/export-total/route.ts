import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function GET() {
  const [{ data: dep }, { data: emis }] = await Promise.all([
    supabaseAdmin.from('factures_depenses').select('*, clubs(nom), types_depenses(nom)').order('date_facture'),
    supabaseAdmin.from('factures_emises').select('*, clubs(nom)').order('date_facture'),
  ])

  const depRows = (dep ?? []).map(d => ({
    'N° Facture': d.numero_facture ?? '',
    'Club': (d as any).clubs?.nom ?? '',
    'Entreprise': d.entreprise ?? '',
    'Type Dépense': (d as any).types_depenses?.nom ?? '',
    'Date Facture': d.date_facture ?? '',
    'Date Paiement': d.date_paiement ?? '',
    'HT (€)': d.ht ?? 0, 'TVA (€)': d.tva ?? 0, 'TTC (€)': d.ttc ?? 0,
    'TVA Récupérable': d.tva_recuperable ? 'Oui' : 'Non',
    'Statut': d.statut ?? '',
    'Commentaire': d.commentaire ?? '',
    'Modifié le': d.updated_at ?? '',
  }))

  const emisRows = (emis ?? []).map(e => ({
    'N° Facture': e.numero_facture ?? '',
    'Club': (e as any).clubs?.nom ?? '',
    'Type': e.type_facture ?? '',
    'HT (€)': e.ht ?? 0, 'TVA (€)': e.tva ?? 0, 'TTC (€)': e.ttc ?? 0,
    'Commission VP %': e.commission_vp_pct ?? 20,
    'Montant VP (€)': e.montant_vp ?? 0,
    'Date Facture': e.date_facture ?? '',
    'Date Paiement Prévue': e.date_paiement_prevue ?? '',
    'Date Paiement Réelle': e.date_paiement_reelle ?? '',
    'Statut Paiement': e.statut_paiement ?? '',
    'Modifié le': (e as any).updated_at ?? '',
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(depRows), 'Dépenses')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(emisRows), 'Facturation VP')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const fileName = `export_total_${new Date().toISOString().slice(0,10)}.xlsx`

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=${fileName}`,
    },
  })
}
