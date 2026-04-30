import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { LanguageStat } from '../types'
import { SectionHeader } from './SectionHeader'

interface Props {
  data: LanguageStat[]
}

const MEANINGFUL_COLORS = [
  '#102556', '#2a60bc', '#61caf9', '#89ffc7',
  '#a7dce8', '#0369a1', '#0ea5e9', '#38bdf8',
]

function fmtLines(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

interface TooltipPayload {
  payload: LanguageStat & { displayLines: number }
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-ascend-navy">{label}</p>
      <p className="text-ascend-muted">{d.lines.toLocaleString()} lines · {d.files} files</p>
      {!d.meaningful && (
        <p className="text-gray-400 mt-0.5 italic">Config / scripts</p>
      )}
    </div>
  )
}

export function LanguageChart({ data }: Props) {
  const meaningful = data.filter(d => d.meaningful).slice(0, 8)
  const noise = data.filter(d => !d.meaningful)

  // Collapsed noise bar — single "Config & Scripts" entry
  const noiseTotalLines = noise.reduce((s, d) => s + d.lines, 0)
  const noiseTotalFiles = noise.reduce((s, d) => s + d.files, 0)
  const noiseEntry: LanguageStat & { displayLines: number } = {
    lang: 'Config & Scripts',
    files: noiseTotalFiles,
    lines: noiseTotalLines,
    meaningful: false,
    displayLines: noiseTotalLines,
  }

  const chartData = [
    ...meaningful.map(d => ({ ...d, displayLines: d.lines })),
    noiseEntry,
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <SectionHeader title="Lines of Code by Language" sub="Source code only — config &amp; scripts grouped separately" />

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 110 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtLines}
            />
            <YAxis
              type="category"
              dataKey="lang"
              tick={({ x, y, payload, index }: { x: number; y: number; payload: { value: string }; index: number }) => {
                const isNoise = index === chartData.length - 1
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    fill={isNoise ? '#9ca3af' : '#102556'}
                    fontSize={isNoise ? 11 : 12}
                    fontStyle={isNoise ? 'italic' : 'normal'}
                  >
                    {payload.value}
                  </text>
                )
              }}
              axisLine={false}
              tickLine={false}
              width={108}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="displayLines" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={entry.lang}
                  fill={entry.meaningful
                    ? MEANINGFUL_COLORS[i % MEANINGFUL_COLORS.length]
                    : '#e5e7eb'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Noise breakdown tooltip */}
      <div className="mt-3 ml-[116px]">
        <p className="text-[10px] text-gray-400 italic">
          Config &amp; Scripts includes:{' '}
          {noise.map(d => `${d.lang} (${fmtLines(d.lines)})`).join(' · ')}
        </p>
      </div>
    </div>
  )
}
