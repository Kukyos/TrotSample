// Hand-rolled inline SVG charts. The colour rationale lives in lib/ramp.ts.
import { rampStep } from '../../lib/ramp'

export type Slice = {
  label: string
  value: number
  display: string
}

type DonutProps = {
  slices: Slice[]
  centerValue: string
  centerLabel: string
  title: string
}

const RADIUS = 62
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 3

export function DonutChart({ slices, centerValue, centerLabel, title }: DonutProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  if (total <= 0) {
    return <p className="chart-empty">Nothing costed yet.</p>
  }

  let offset = 0

  return (
    <figure className="chart chart-donut">
      <svg viewBox="0 0 160 160" role="img" aria-label={title}>
        <circle className="donut-track" cx="80" cy="80" r={RADIUS} />
        {slices.map((slice, index) => {
          const length = (slice.value / total) * CIRCUMFERENCE
          const dash = Math.max(length - GAP, 1)
          const segment = (
            <circle
              key={slice.label}
              className="donut-segment"
              cx="80"
              cy="80"
              r={RADIUS}
              stroke={rampStep(index)}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={-offset}
            >
              {/* ponytail: native <title> tooltip; every value is also printed in the
                  legend below, so nothing is hover-only */}
              <title>{`${slice.label}: ${slice.display}`}</title>
            </circle>
          )
          offset += length
          return segment
        })}
        <text className="donut-value" x="80" y="76">{centerValue}</text>
        <text className="donut-label" x="80" y="94">{centerLabel}</text>
      </svg>

      <figcaption className="chart-legend">
        {slices.map((slice, index) => (
          <span key={slice.label}>
            <i aria-hidden="true" style={{ background: rampStep(index) }} />
            <b>{slice.label}</b>
            <em>{slice.display}</em>
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

type BarSeriesProps = {
  title: string
  slices: Slice[]
  caption?: string
}

export function BarSeries({ title, slices, caption }: BarSeriesProps) {
  const max = Math.max(...slices.map((slice) => slice.value), 1)

  return (
    <figure className="chart chart-bars">
      <figcaption className="chart-title">{title}</figcaption>
      <ol>
        {slices.map((slice, index) => (
          <li key={slice.label}>
            <span className="bar-label">{slice.label}</span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{
                  width: `${(slice.value / max) * 100}%`,
                  background: rampStep(index),
                }}
              />
            </span>
            <span className="bar-value">{slice.display}</span>
          </li>
        ))}
      </ol>
      {caption && <p className="chart-caption">{caption}</p>}
    </figure>
  )
}

type TrendPoint = { label: string; value: number }

/** Single series, so no legend — the title names it. */
export function TrendLine({ title, points, caption }: { title: string; points: TrendPoint[]; caption?: string }) {
  const max = Math.max(...points.map((point) => point.value), 1)
  const width = 100
  const height = 34
  const step = width / Math.max(points.length - 1, 1)
  const coords = points.map((point, index) => ({
    x: index * step,
    y: height - (point.value / max) * (height - 4) - 2,
  }))
  const line = coords.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <figure className="chart chart-trend">
      <figcaption className="chart-title">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={title}>
        <path className="trend-area" d={area} />
        <path className="trend-line" d={line} />
        {coords.map((point, index) => (
          <circle key={points[index].label} className="trend-dot" cx={point.x} cy={point.y} r="1.4">
            <title>{`${points[index].label}: ${points[index].value}`}</title>
          </circle>
        ))}
      </svg>
      <ol className="trend-axis">
        {points.map((point) => (
          <li key={point.label}>{point.label}</li>
        ))}
      </ol>
      {caption && <p className="chart-caption">{caption}</p>}
    </figure>
  )
}

export function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {note && <span className="stat-note">{note}</span>}
    </div>
  )
}

/** Accessibility fallback the dataviz rules require alongside any chart. */
export function ChartTable({ caption, slices }: { caption: string; slices: Slice[] }) {
  return (
    <details className="chart-table">
      <summary>View as table</summary>
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr><th scope="col">Category</th><th scope="col">Amount</th></tr>
        </thead>
        <tbody>
          {slices.map((slice) => (
            <tr key={slice.label}>
              <th scope="row">{slice.label}</th>
              <td>{slice.display}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
