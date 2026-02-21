import DashboardKPI from '@/components/DashboardKPI'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble Village Padel VP</p>
      </div>
      <DashboardKPI />
    </div>
  )
}
