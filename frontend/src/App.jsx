import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import InputNode from "./components/InputNode";
import ResultNode from "./components/ResultNode";

const nodeTypes = { inputNode: InputNode, resultNode: ResultNode };

const BACKEND = import.meta.env.VITE_BACKEND_URL || "";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved' | 'error'
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const initialNodes = [
    {
      id: "input",
      type: "inputNode",
      position: { x: 60, y: 180 },
      data: { prompt: "", onPromptChange: () => {} },
    },
    {
      id: "result",
      type: "resultNode",
      position: { x: 520, y: 180 },
      data: { response: "", loading: false },
    },
  ];

  const initialEdges = [
    {
      id: "e-input-result",
      source: "input",
      target: "result",
      animated: true,
      style: { stroke: "#7b61ff", strokeWidth: 2 },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Keep InputNode in sync with prompt state
  const updateNodes = useCallback(
    (newPrompt, newResponse, newLoading) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === "input") {
            return { ...n, data: { ...n.data, prompt: newPrompt } };
          }
          if (n.id === "result") {
            return { ...n, data: { ...n.data, response: newResponse, loading: newLoading } };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  // Sync prompt changes into the node
  const handlePromptChange = useCallback(
    (val) => {
      setPrompt(val);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === "input" ? { ...n, data: { ...n.data, prompt: val } } : n
        )
      );
    },
    [setNodes]
  );

  // Initialize node with correct handler after mount
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === "input" ? { ...n, data: { ...n.data, onPromptChange: handlePromptChange } } : n
      )
    );
  }, [setNodes, handlePromptChange]);

  const runFlow = async () => {
    if (!prompt.trim()) {
      showToast("Please enter a prompt first.", "error");
      return;
    }
    setLoading(true);
    setResponse("");
    updateNodes(prompt, "", true);

    try {
      const res = await fetch(`${BACKEND}/api/ask-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResponse(data.response);
      updateNodes(prompt, data.response, false);
      showToast("AI responded!", "success");
    } catch (err) {
      const errMsg = "Error: " + err.message;
      setResponse(errMsg);
      updateNodes(prompt, errMsg, false);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const saveConversation = async () => {
    if (!prompt.trim() || !response) {
      showToast("Run the flow first before saving.", "error");
      return;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch(`${BACKEND}/api/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, response }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaveStatus("saved");
      showToast("Saved to database! ✓", "success");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      setSaveStatus("error");
      showToast("Save failed: " + err.message, "error");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={hdr.wrap}>
        <div style={hdr.left}>
          <div style={hdr.logo}>
            <span style={hdr.logoIcon}>DABLU</span>
            <span style={hdr.logoText}>AI FLOW</span>
          </div>
          {/* <span style={hdr.tag}>MERN · React Flow · OpenRouter</span> */}
        </div>
        <div style={hdr.actions}>
          <button
            onClick={runFlow}
            disabled={loading}
            style={{ ...btn.base, ...btn.primary, ...(loading ? btn.disabled : {}) }}
          >
            {loading ? (
              <>
                <span style={btn.spinner} />
                Running…
              </>
            ) : (
              <>▶ Run Flow</>
            )}
          </button>
          <button
            onClick={saveConversation}
            disabled={saveStatus === "saving"}
            style={{
              ...btn.base,
              ...btn.save,
              ...(saveStatus === "saved" ? btn.saved : {}),
              ...(saveStatus === "saving" ? btn.disabled : {}),
            }}
          >
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : "⬇ Save"}
          </button>
        </div>
      </header>

      {/* ── React Flow Canvas ───────────────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.4}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2a2a3a" />
          <Controls
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          />
        </ReactFlow>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ ...toastStyle.base, ...(toast.type === "error" ? toastStyle.error : toastStyle.success) }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const hdr = {
  wrap: {
    height: 60,
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    flexShrink: 0,
    zIndex: 10,
  },
  left: { display: "flex", alignItems: "center", gap: 20 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 22, color: "var(--accent2)" },
  logoText: {
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: "0.2em",
    color: "var(--text)",
  },
  tag: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-muted)",
    background: "var(--surface2)",
    padding: "3px 10px",
    borderRadius: 20,
    border: "1px solid var(--border)",
  },
  actions: { display: "flex", gap: 10 },
};

const btn = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.05em",
    padding: "9px 20px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    transition: "all 0.18s",
  },
  primary: {
    background: "var(--accent2)",
    color: "#fff",
  },
  save: {
    background: "var(--surface2)",
    color: "var(--accent)",
    border: "1px solid var(--accent)55",
  },
  saved: {
    background: "#003d2844",
    color: "var(--accent)",
    border: "1px solid var(--accent)",
  },
  disabled: { opacity: 0.5, cursor: "not-allowed" },
  spinner: {
    display: "inline-block",
    width: 12,
    height: 12,
    border: "2px solid #fff3",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};

const toastStyle = {
  base: {
    position: "fixed",
    bottom: 24,
    right: 24,
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    padding: "12px 20px",
    borderRadius: 10,
    zIndex: 9999,
    boxShadow: "0 8px 32px #0008",
    animation: "fadeIn 0.2s ease",
  },
  success: {
    background: "#003d28",
    color: "var(--accent)",
    border: "1px solid var(--accent)55",
  },
  error: {
    background: "#3d0015",
    color: "var(--danger)",
    border: "1px solid var(--danger)55",
  },
};
