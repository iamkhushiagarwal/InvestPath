export default function LedgerBar({ label, value }) {
  const color = value >= 50 ? "#00C2A8" : "#FF6B6B";

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#8A93A6",
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        <span style={{ fontFamily: "monospace", color: "#0E1F4B" }}>{value.toFixed(0)}</span>
      </div>
      <div style={{ height: 6, background: "#F0F2FA", borderRadius: 4 }}>
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}