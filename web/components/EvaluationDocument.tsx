interface Props {
  html: string
}

export default function EvaluationDocument({ html }: Props) {
  return (
    <div
      className="evaluation-prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
