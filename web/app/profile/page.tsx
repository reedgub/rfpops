import { getProfileContent } from '@/lib/filesystem'
import { markdownToHtml } from '@/lib/markdown'

export default async function ProfilePage() {
  const { capabilities, team } = getProfileContent()
  const capHtml = capabilities ? await markdownToHtml(capabilities) : null
  const teamHtml = team ? await markdownToHtml(team) : null

  return (
    <div>
      <h1 className="text-xl font-medium text-neutral-100 mb-8">Agency Profile</h1>

      {capHtml ? (
        <div>
          <h2 className="text-xs text-neutral-500 uppercase tracking-widest mb-4 pb-2 border-b border-[#222222]">
            Capabilities
          </h2>
          <div className="evaluation-prose prose-sm max-w-none mb-12" dangerouslySetInnerHTML={{ __html: capHtml }} />
        </div>
      ) : null}

      {teamHtml ? (
        <div>
          <h2 className="text-xs text-neutral-500 uppercase tracking-widest mb-4 pb-2 border-b border-[#222222]">
            Key Personnel
          </h2>
          <div className="evaluation-prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: teamHtml }} />
        </div>
      ) : null}

      {!capHtml && !teamHtml && (
        <p className="text-neutral-500">Profile not found. Run <code className="text-[#FCD34D]">/onboard</code> to set up your agency profile.</p>
      )}
    </div>
  )
}
