export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRFPDetail } from '@/lib/filesystem'
import { markdownToHtml } from '@/lib/markdown'
import Verdict from '@/components/Verdict'
import ScoreBreakdown from '@/components/ScoreBreakdown'
import EvaluationDocument from '@/components/EvaluationDocument'

export default async function RFPDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab: tabParam } = await searchParams

  const detail = getRFPDetail(slug)
  if (!detail) notFound()

  const tab = tabParam || 'evaluation'
  const evalHtml = detail.evaluationMd ? await markdownToHtml(detail.evaluationMd) : null
  const complianceHtml = detail.complianceMd ? await markdownToHtml(detail.complianceMd) : null

  const eval_json = detail.evaluationJson as Record<string, unknown> | null
  const dimensions = eval_json?.dimensions as Record<string, { score: number; rationale: string }> | undefined
  const disqualifierCheck = (eval_json?.disqualifier_check as string) || 'UNKNOWN'

  const tabs = ['evaluation', 'compliance', 'drafts']

  return (
    <div>
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-[#222222]">
        <div className="flex items-start justify-between">
          <div>
            <Link href="/" className="text-neutral-500 text-xs hover:text-neutral-300 mb-2 block">
              ← RFP Pipeline
            </Link>
            <h1 className="text-xl font-medium text-neutral-100 tracking-tight">{detail.meta.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-neutral-500 text-sm">{detail.meta.agency}</span>
              {detail.meta.deadline !== 'Unknown' && (
                <span className="mono text-xs text-neutral-500">
                  Due: {new Date(detail.meta.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {detail.meta.daysUntilDeadline !== null && (
                    <span className={`ml-1 ${detail.meta.daysUntilDeadline <= 7 ? 'text-[#FCD34D]' : 'text-neutral-600'}`}>
                      ({detail.meta.daysUntilDeadline}d)
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <Verdict verdict={detail.meta.verdict} />
            {detail.meta.compositeScore !== null && (
              <div className="mono text-2xl font-light mt-1 text-neutral-200">
                {detail.meta.compositeScore.toFixed(1)}
                <span className="text-sm text-neutral-500">/5</span>
              </div>
            )}
          </div>
        </div>

        {/* Score breakdown */}
        {dimensions && (
          <div className="mt-6">
            <ScoreBreakdown dimensions={dimensions} disqualifierCheck={disqualifierCheck} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-[#222222]">
        {tabs.map(t => (
          <Link
            key={t}
            href={`/rfp/${slug}?tab=${t}`}
            className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'text-[#FCD34D] border-[#FCD34D]'
                : 'text-neutral-500 border-transparent hover:text-neutral-300'
            }`}
          >
            {t.replace('-', ' ')}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'evaluation' && (
        <div>
          {evalHtml ? (
            <EvaluationDocument html={evalHtml} />
          ) : (
            <p className="text-neutral-500">No evaluation yet. Run <code className="text-[#FCD34D]">/evaluate</code> first.</p>
          )}
        </div>
      )}

      {tab === 'compliance' && (
        <div>
          {complianceHtml ? (
            <div className="evaluation-prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: complianceHtml }} />
          ) : (
            <p className="text-neutral-500">
              No compliance matrix yet. Run <code className="text-[#FCD34D]">/compliance {slug}</code>
            </p>
          )}
        </div>
      )}

      {tab === 'drafts' && (
        <div>
          {detail.drafts.length > 0 ? (
            <div className="space-y-8">
              {detail.drafts.map(({ section, content }) => (
                <div key={section}>
                  <h3 className="text-xs text-neutral-500 uppercase tracking-widest mb-4 pb-2 border-b border-[#222222]">
                    {section.replace('-', ' ')}
                  </h3>
                  <div className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">
              No drafts yet. Run <code className="text-[#FCD34D]">/draft {slug} exec-summary</code>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
