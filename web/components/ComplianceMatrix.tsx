'use client'

interface Requirement {
  id: string
  text: string
  category: string
  status: string
  evidence: string
  notes: string
}

interface Props {
  requirements: Requirement[]
  rfpTitle: string
}

const STATUS_STYLES: Record<string, string> = {
  'MET': 'text-[#6EE7B7]',
  'GAP': 'text-[#F87171]',
  'PARTIAL': 'text-[#FCD34D]',
  'UNCLEAR': 'text-neutral-400',
}

export default function ComplianceMatrix({ requirements, rfpTitle }: Props) {
  const metCount = requirements.filter(r => r.status === 'MET').length
  const gapCount = requirements.filter(r => r.status === 'GAP').length
  const partialCount = requirements.filter(r => r.status === 'PARTIAL').length

  return (
    <div>
      <div className="flex gap-6 mb-6 pb-4 border-b border-[#222222]">
        <div>
          <div className="mono text-2xl text-[#6EE7B7]">{metCount}</div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">Met</div>
        </div>
        <div>
          <div className="mono text-2xl text-[#F87171]">{gapCount}</div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">Gap</div>
        </div>
        <div>
          <div className="mono text-2xl text-[#FCD34D]">{partialCount}</div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">Partial</div>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#222222]">
            {['ID', 'Requirement', 'Status', 'Evidence'].map(h => (
              <th key={h} className="text-left text-xs text-neutral-500 tracking-widest uppercase py-2 px-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requirements.map((req, i) => (
            <tr key={i} className="border-b border-[#1a1a1a] hover:bg-[#111111]">
              <td className="py-2 px-2 mono text-xs text-neutral-400 whitespace-nowrap">{req.id}</td>
              <td className="py-2 px-2 text-neutral-300 max-w-xs">
                <span className="line-clamp-2 text-xs">{req.text}</span>
              </td>
              <td className="py-2 px-2 whitespace-nowrap">
                <span className={`mono text-xs font-medium ${STATUS_STYLES[req.status] || 'text-neutral-400'}`}>
                  {req.status}
                </span>
              </td>
              <td className="py-2 px-2 text-neutral-500 text-xs max-w-xs">
                <span className="line-clamp-2">{req.evidence || '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
