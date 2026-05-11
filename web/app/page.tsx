import { listRFPs } from '@/lib/filesystem'
import RFPListTable from '@/components/RFPListTable'

export default function HomePage() {
  const rfps = listRFPs()

  const bidCount = rfps.filter(r => r.verdict === 'BID').length
  const maybeCount = rfps.filter(r => r.verdict === 'MAYBE').length
  const urgentCount = rfps.filter(r => r.daysUntilDeadline !== null && r.daysUntilDeadline <= 7 && r.daysUntilDeadline >= 0).length

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium text-neutral-100 tracking-tight">RFP Pipeline</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {rfps.length} opportunities · {bidCount} BID · {maybeCount} MAYBE
            {urgentCount > 0 && <span className="text-[#FCD34D] ml-2">· {urgentCount} due soon</span>}
          </p>
        </div>
        <code className="text-xs text-neutral-600 bg-[#111111] px-3 py-1.5 border border-[#222222]">
          /evaluate &lt;url-or-path&gt;
        </code>
      </div>
      <RFPListTable rfps={rfps} />
    </div>
  )
}
