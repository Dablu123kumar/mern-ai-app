import { Handle, Position } from "@xyflow/react";

const styles = {
  node: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    width: "var(--node-w)",
    boxShadow: "0 0 0 1px var(--accent)33, 0 20px 60px #0008",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #00c98a, #00ffb3)",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  headerLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 700,
    color: "#003d28",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#003d28",
    opacity: 0.5,
  },
  body: { padding: "16px" },
  responseBox: {
    minHeight: "110px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    lineHeight: 1.7,
    color: "var(--text)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowY: "auto",
    maxHeight: "220px",
  },
  empty: {
    color: "var(--text-muted)",
    fontStyle: "italic",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--accent)",
  },
  spinner: {
    width: 14,
    height: 14,
    border: "2px solid var(--accent)44",
    borderTopColor: "var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};

const spinKeyframes = `@keyframes spin { to { transform: rotate(360deg); } }`;

export default function ResultNode({ data }) {
  return (
    <div style={styles.node}>
      <style>{spinKeyframes}</style>
      <Handle type="target" position={Position.Left} />
      <div style={styles.header}>
        <div style={styles.dot} />
        <span style={styles.headerLabel}>AI Response</span>
      </div>
      <div style={styles.body}>
        <div style={styles.responseBox}>
          {data.loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <span>Thinking…</span>
            </div>
          ) : data.response ? (
            data.response
          ) : (
            <span style={styles.empty}>Response will appear here after you run the flow.</span>
          )}
        </div>
      </div>
    </div>
  );
}
