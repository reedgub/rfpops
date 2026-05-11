interface DimensionScore {
  score: number
  rationale: string
}

interface ScoreBreakdownProps {
  dimensions: Record<string, DimensionScore>
  disqualifierCheck: string
}

const DIMENSION_LABELS: Record<string, { label: string; weight: string }> = {
  capability_match: { label: 'Capability Match', weight: '30%' },
  past_performance: { label: 'Past Performance', weight: '25%' },
  win_probability: { label: 'Win Probability', weight: '20%' },
  margin_viability: { label: 'Margin Viability', weight: '15%' },
  strategic_fit: { label: 'Strategic Fit', weight: '10%' },
  disqualifiers: { label: 'Disqualifiers', weight: 'GATE' },
}

export default function ScoreBreakdown({ dimensions, disqualifierCheck }: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      {Object.entries(DIMENSION_LABELS).map(([key, { label, weight }]) => {
        if (key === 'disqualifiers') {
          const pass = disqualifierCheck === 'PASS'
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-neutral-500 text-xs mono w-6">{weight}</span>
              <span className="text-neutral-300 text-sm w-36">{label}</span>
              <span className={`text-xs mono font-medium ${pass ? 'text-[#6EE7B7]' : 'text-[#F87171]'}`}>
                {disqualifierCheck}
              </span>
            </div>
          )
        }

        const dim = dimensions?.[key]
        if (!dim) return null
        const score = dim.score
        const pct = (score / 5) * 100
        const barColor = score >= 4 ? '#6EE7B7' : score >= 3 ? '#FCD34D' : '#F87171'

        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-xs mono w-6">{weight}</span>
              <span className="text-neutral-300 text-sm w-36">{label}</span>
              <div className="flex-1 bg-neutral-800 h-1.5">
                <div
                  className="h-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
              <span className="mono text-sm font-medium" style={{ color: barColor }}>
                {score}/5
              </span>
            </div>
            {dim.rationale && (
              <p className="text-neutral-500 text-xs pl-9 leading-relaxed line-clamp-2">
                {dim.rationale}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
