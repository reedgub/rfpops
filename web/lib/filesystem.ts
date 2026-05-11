import fs from 'fs'
import path from 'path'

const RFP_DIR = path.join(process.cwd(), '..', 'rfps')
const PROFILE_DIR = path.join(process.cwd(), '..', 'profile')

export interface RFPMeta {
  slug: string
  title: string
  agency: string
  verdict: 'BID' | 'NO-BID' | 'MAYBE' | null
  compositeScore: number | null
  deadline: string
  status: 'Evaluated' | 'Drafting' | 'Extracted' | 'Unknown'
  daysUntilDeadline: number | null
}

export interface RFPDetail {
  slug: string
  meta: RFPMeta
  evaluationMd: string | null
  complianceMd: string | null
  drafts: { section: string; content: string }[]
  evaluationJson: Record<string, unknown> | null
}

export function listRFPs(): RFPMeta[] {
  if (!fs.existsSync(RFP_DIR)) return []

  const entries = fs.readdirSync(RFP_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)

  const rfps: RFPMeta[] = entries.map(slug => {
    const dir = path.join(RFP_DIR, slug)
    let evaluationJson: Record<string, unknown> | null = null
    let extractedJson: Record<string, unknown> | null = null

    const evalJsonPath = path.join(dir, 'evaluation.json')
    if (fs.existsSync(evalJsonPath)) {
      try { evaluationJson = JSON.parse(fs.readFileSync(evalJsonPath, 'utf-8')) } catch {}
    }

    const extractedPath = path.join(dir, 'rfp_extracted.json')
    if (fs.existsSync(extractedPath)) {
      try { extractedJson = JSON.parse(fs.readFileSync(extractedPath, 'utf-8')) } catch {}
    }

    const title = (extractedJson?.title as string) || (evaluationJson?.rfp_title as string) || slug
    const agency = (extractedJson?.agency as string) || 'Unknown'
    const deadline = (extractedJson?.deadline as string) || 'Unknown'
    const verdict = (evaluationJson?.verdict as 'BID' | 'NO-BID' | 'MAYBE') || null
    const compositeScore = typeof evaluationJson?.composite_score === 'number'
      ? evaluationJson.composite_score as number : null

    let daysUntilDeadline: number | null = null
    if (deadline && deadline !== 'Unknown') {
      const d = new Date(deadline)
      if (!isNaN(d.getTime())) {
        daysUntilDeadline = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }
    }

    const hasDrafts = fs.existsSync(path.join(dir, 'draft'))
    const hasEval = fs.existsSync(evalJsonPath)
    const status: RFPMeta['status'] = hasDrafts ? 'Drafting' : hasEval ? 'Evaluated' : 'Extracted'

    return { slug, title, agency, verdict, compositeScore, deadline, status, daysUntilDeadline }
  })

  return rfps.sort((a, b) => {
    if (!a.deadline || a.deadline === 'Unknown') return 1
    if (!b.deadline || b.deadline === 'Unknown') return -1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })
}

export function getRFPDetail(slug: string): RFPDetail | null {
  const dir = path.join(RFP_DIR, slug)
  if (!fs.existsSync(dir)) return null

  const metas = listRFPs()
  const meta = metas.find(m => m.slug === slug)
  if (!meta) return null

  const evaluationMd = readFileIfExists(path.join(dir, 'evaluation.md'))
  const complianceMd = readFileIfExists(path.join(dir, 'compliance.md'))

  let evaluationJson: Record<string, unknown> | null = null
  const evalJsonPath = path.join(dir, 'evaluation.json')
  if (fs.existsSync(evalJsonPath)) {
    try { evaluationJson = JSON.parse(fs.readFileSync(evalJsonPath, 'utf-8')) } catch {}
  }

  // Load drafts
  const drafts: { section: string; content: string }[] = []
  const draftDir = path.join(dir, 'draft')
  if (fs.existsSync(draftDir)) {
    const draftFiles = fs.readdirSync(draftDir).filter(f => f.endsWith('.md'))
    for (const f of draftFiles) {
      const section = f.replace('.md', '')
      const content = fs.readFileSync(path.join(draftDir, f), 'utf-8')
      drafts.push({ section, content })
    }
  }

  return { slug, meta, evaluationMd, complianceMd, drafts, evaluationJson }
}

function readFileIfExists(filePath: string): string | null {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8')
  }
  return null
}

export function getProfileContent(): { capabilities: string; team: string } {
  const readMd = (filename: string) => {
    const p = path.join(PROFILE_DIR, filename)
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : ''
  }
  return {
    capabilities: readMd('capabilities.md'),
    team: readMd('team.md'),
  }
}
