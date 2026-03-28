import { Handle, Position } from "@xyflow/react";

const styles = {
  node: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    width: "var(--node-w)",
    boxShadow: "0 0 0 1px var(--accent2)33, 0 20px 60px #0008",
    overflow: "hidden",
  },
  header: {
    background: "var(--accent2)",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  headerLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#fff",
    opacity: 0.7,
  },
  body: { padding: "16px" },
  textarea: {
    width: "100%",
    minHeight: "110px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text)",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    lineHeight: 1.6,
    padding: "12px",
    resize: "vertical",
    outline: "none",
    transition: "border-color 0.2s",
  },
  hint: {
    marginTop: "8px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--text-muted)",
  },
};

export default function InputNode({ data }) {
  return (
    <div style={styles.node}>
      <div style={styles.header}>
        <div style={styles.dot} />
        <span style={styles.headerLabel}>Prompt Input</span>
      </div>
      <div style={styles.body}>
        <textarea
          style={styles.textarea}
          placeholder="Ask anything… e.g. What is the capital of France?"
          value={data.prompt}
          onChange={(e) => data.onPromptChange(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent2)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <p style={styles.hint}>↑ Type your prompt here</p>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
