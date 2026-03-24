const tones = [
  "from-[#6C47FF] via-[#8B5CF6] to-[#FF6B97]",
  "from-[#3B82F6] via-[#60A5FA] to-[#10B981]",
  "from-[#F59E0B] via-[#F97316] to-[#EF4444]",
  "from-[#6366F1] via-[#8B5CF6] to-[#EC4899]",
]

export default function AvatarStack() {
  return (
    <div className="flex items-center">
      {tones.map((tone, index) => (
        <div
          key={tone}
          className={`-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${tone} shadow-soft`}
          style={{ zIndex: tones.length - index }}
        >
          <span className="text-[11px] font-semibold text-white">{index + 1}</span>
        </div>
      ))}
    </div>
  )
}
