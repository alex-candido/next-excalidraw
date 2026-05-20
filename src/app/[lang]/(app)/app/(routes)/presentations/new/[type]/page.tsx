type Props = {
  params: Promise<{ type: "single" | "multi" }>
}

export default async function NewPresentationPage({ params }: Props) {
  const { type } = await params
  return <div>New Presentation — {type}</div>
}
