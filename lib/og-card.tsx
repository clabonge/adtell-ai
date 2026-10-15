export function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0e1f1c",
        color: "#f4efe6",
        padding: "72px",
      }}
    >
      <div style={{ display: "flex", fontSize: 36, letterSpacing: "-0.04em" }}>
        Adtell.ai
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 64,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          maxWidth: 920,
        }}
      >
        Cut the cost of work that should not still be done by hand.
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#f0b08a" }}>
        Free AI savings audit
      </div>
    </div>
  );
}
