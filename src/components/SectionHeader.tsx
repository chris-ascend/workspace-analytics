interface SectionHeaderProps {
  title: string
  sub?: string
}

export function SectionHeader({ title, sub }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}
