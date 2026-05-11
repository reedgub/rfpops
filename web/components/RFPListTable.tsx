'use client'

import Link from 'next/link'
import Verdict from './Verdict'
import { RFPMeta } from '@/lib/filesystem'

interface Props {
  rfps: RFPMeta[]
}

function DeadlineCell({ deadline, days }: { deadline: string; days: number | null }) {
  if (!deadline || deadline === 'Unknown') return <span className="text-neutral-600">—</span>

  const colorClass = days === null ? 'text-neutral-400'
    : days < 0 ? 'text-[#F87171]'
    : days <= 7 ? 'text-[#FCD34D]'
    : 'text-[#6EE7B7]'

  const relativeStr = days === null ? ''
    : days < 0 ? `${Math.abs(days)}d ago`
    : `${days}d`

  return (
    <span className={`mono text-sm ${colorClass}`}>
      {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      {relativeStr && <span className="text-xs ml-1 opacity-70">{relativeStr}</span>}
    </span>
  )
}

export default function RFPListTable({ rfps }: Props) {
  if (rfps.length === 0) {
    return (
      <div className="border border-[#222222] p-8 text-center">
        <p className="text-neutral-500 mb-3">No RFPs evaluated yet.</p>
        <code className="text-[#FCD34D] text-sm bg-[#111111] px-3 py-1.5">
          /evaluate &lt;rfp-url-or-path&gt;
        </code>
      </div>
    )
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[#222222]">
          {['RFP', 'Agency', 'Score', 'Verdict', 'Due', 'Status'].map(h => (
            <th key={h} className="text-left text-xs text-neutral-500 tracking-widest uppercase py-2 px-3 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rfps.map(rfp => (
          <tr
            key={rfp.slug}
            className="border-b border-[#1a1a1a] hover:bg-[#111111] transition-colors cursor-pointer"
          >
            <td className="py-3 px-3">
              <Link href={`/rfp/${rfp.slug}`} className="hover:text-[#FCD34D] transition-colors">
                <span className="text-neutral-200 text-sm font-medium">{rfp.title}</span>
              </Link>
            </td>
            <td className="py-3 px-3 text-neutral-500 text-sm">{rfp.agency}</td>
            <td className="py-3 px-3">
              {rfp.compositeScore !== null
                ? <span className="mono text-sm text-neutral-200">{rfp.compositeScore.toFixed(1)}</span>
                : <span className="text-neutral-600">—</span>
              }
            </td>
            <td className="py-3 px-3">
              <Verdict verdict={rfp.verdict} size="sm" />
            </td>
            <td className="py-3 px-3">
              <DeadlineCell deadline={rfp.deadline} days={rfp.daysUntilDeadline} />
            </td>
            <td className="py-3 px-3">
              <span className="text-xs text-neutral-500">{rfp.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
