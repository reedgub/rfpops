interface VerdictProps {
  verdict: 'BID' | 'NO-BID' | 'MAYBE' | null
  size?: 'sm' | 'md'
}

const VERDICT_STYLES: Record<string, string> = {
  'BID': 'text-[#6EE7B7] border-[#6EE7B7]',
  'NO-BID': 'text-[#F87171] border-[#F87171]',
  'MAYBE': 'text-[#FCD34D] border-[#FCD34D]',
}

export default function Verdict({ verdict, size = 'md' }: VerdictProps) {
  if (!verdict) return <span className="text-neutral-600 text-xs mono">—</span>

  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
  const colorClass = VERDICT_STYLES[verdict] || 'text-neutral-400 border-neutral-400'

  return (
    <span className={`mono border font-medium tracking-wider ${sizeClass} ${colorClass}`}>
      {verdict}
    </span>
  )
}
