export default function Sparkline({ data, width = 200, height = 40 }) {
  if (!data || data.length < 2) return null;

  const values = data.map((d) => d.revenue).filter((v) => v != null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // avoid divide-by-zero if all years are equal

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.revenue - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = values[values.length - 1] >= values[0];

  return (
    <div>
      <svg width={width} height={height}>
        <polyline
          points={points}
          fill="none"
          stroke={isUp ? "#00C2A8" : "#FF6B6B"}
          strokeWidth="2"
        />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8A93A6" }}>
        <span>{data[0].year}</span>
        <span>{data[data.length - 1].year}</span>
      </div>
    </div>
  );
}