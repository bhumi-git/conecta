import { useState, useEffect, useRef } from "react"
import {
  collection, doc, getDoc,
  addDoc, onSnapshot, serverTimestamp,
  query, orderBy, setDoc
} from "firebase/firestore"
import { db } from "./firebase"

// ── Chat ID helper — same room regardless of who opens first ──
const getChatId = (uid1, uid2) => [uid1, uid2].sort().join("_")

// ── Relative time ─────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return ""
  const secs = Math.floor((Date.now() - (ts.toMillis?.() || 0)) / 1000)
  if (secs < 60)    return "just now"
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export default function ChatView({ profile, uid, T }) {
  const [connections, setConnections]   = useState([])  // full user objects
  const [activeUser, setActiveUser]     = useState(null) // selected chat partner
  const [messages, setMessages]         = useState([])
  const [text, setText]                 = useState("")
  const [sending, setSending]           = useState(false)
  const [loading, setLoading]           = useState(true)
  const [lastMessages, setLastMessages] = useState({})  // chatId → last msg preview
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // ── Load connected users ──────────────────────────────────
  useEffect(() => {
    if (!uid) return
    const loadConnections = async () => {
      setLoading(true)
      const myDoc = await getDoc(doc(db, "users", uid))
      const connIds = myDoc.data()?.connections || []

      if (connIds.length === 0) { setLoading(false); return }

      const users = await Promise.all(
        connIds.map(async (id) => {
          const snap = await getDoc(doc(db, "users", id))
          return snap.exists() ? { id, ...snap.data() } : null
        })
      )
      setConnections(users.filter(Boolean))
      setLoading(false)
    }
    loadConnections()
  }, [uid])

  // ── Load last message for each connection (preview) ───────
  useEffect(() => {
    if (!connections.length) return
    const unsubs = connections.map(conn => {
      const chatId = getChatId(uid, conn.id)
      return onSnapshot(
        query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "desc")),
        snap => {
          const last = snap.docs[0]?.data()
          setLastMessages(prev => ({
            ...prev,
            [conn.id]: last ? { text: last.text, ts: last.createdAt } : null
          }))
        }
      )
    })
    return () => unsubs.forEach(u => u())
  }, [connections, uid])

  // ── Listen to messages for active chat ────────────────────
  useEffect(() => {
    if (!activeUser) return
    setMessages([])
    const chatId = getChatId(uid, activeUser.id)
    const unsub  = onSnapshot(
      query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc")),
      snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    return () => unsub()
  }, [activeUser, uid])

  // ── Scroll to bottom when messages change ─────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── Focus input when chat opens ───────────────────────────
  useEffect(() => {
    if (activeUser) setTimeout(() => inputRef.current?.focus(), 100)
  }, [activeUser])

  // ── Send message ──────────────────────────────────────────
  const sendMessage = async () => {
    if (!text.trim() || !activeUser || sending) return
    setSending(true)
    const chatId  = getChatId(uid, activeUser.id)
    const chatRef = doc(db, "chats", chatId)
    try {
      // Create/update chat metadata
      await setDoc(chatRef, {
        participants: [uid, activeUser.id],
        lastMessage:  text.trim(),
        lastAt:       serverTimestamp(),
      }, { merge: true })

      // Add message
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text:       text.trim(),
        senderId:   uid,
        senderName: profile?.name || "You",
        createdAt:  serverTimestamp(),
      })
      setText("")
    } catch (e) { console.error("Send error:", e) }
    setSending(false)
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Styles ────────────────────────────────────────────────
  const S = {
    root: {
      display: "flex",
      height: "calc(100vh - 112px)",
      background: T.card,
      borderRadius: 16,
      border: `1px solid ${T.border}`,
      overflow: "hidden",
    },

    // Left panel
    left: {
      width: 300,
      borderRight: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    },
    leftHeader: {
      padding: "20px 20px 16px",
      borderBottom: `1px solid ${T.border}`,
    },
    leftTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: T.text,
      margin: "0 0 2px",
    },
    leftSub: {
      fontSize: 12,
      color: T.muted,
    },
    connList: {
      flex: 1,
      overflowY: "auto",
      padding: "8px 0",
    },
    connItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 20px",
      cursor: "pointer",
      background: active ? T.accentLight : "transparent",
      borderLeft: active ? `3px solid ${T.accent}` : "3px solid transparent",
      transition: "background 0.15s",
    }),
    avatar: (isTeacher) => ({
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: isTeacher ? "#2D3B8E" : T.accentLight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      flexShrink: 0,
    }),
    connName: {
      fontSize: 14,
      fontWeight: 600,
      color: T.text,
      margin: "0 0 2px",
    },
    connPreview: {
      fontSize: 12,
      color: T.muted,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: 160,
    },

    // Right panel
    right: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },

    // Chat header
    chatHeader: {
      padding: "16px 24px",
      borderBottom: `1px solid ${T.border}`,
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: T.card,
    },
    chatAvatar: (isTeacher) => ({
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: isTeacher ? "#2D3B8E" : T.accentLight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
    }),
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#22c55e",
      marginLeft: "auto",
      flexShrink: 0,
    },

    // Messages area
    messagesArea: {
      flex: 1,
      overflowY: "auto",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },

    // Message bubble
    bubble: (isMine) => ({
      maxWidth: "65%",
      alignSelf: isMine ? "flex-end" : "flex-start",
      background: isMine ? T.accent : T.hover,
      color: isMine ? "#fff" : T.text,
      padding: "10px 14px",
      borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      fontSize: 14,
      lineHeight: 1.5,
      wordBreak: "break-word",
    }),
    bubbleTime: (isMine) => ({
      fontSize: 10,
      color: isMine ? "rgba(255,255,255,0.6)" : T.muted,
      marginTop: 4,
      textAlign: isMine ? "right" : "left",
      alignSelf: isMine ? "flex-end" : "flex-start",
    }),

    // Date divider
    dateDivider: {
      textAlign: "center",
      fontSize: 11,
      color: T.muted,
      padding: "8px 0",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      background: T.border,
    },

    // Input area
    inputArea: {
      padding: "16px 24px",
      borderTop: `1px solid ${T.border}`,
      display: "flex",
      alignItems: "flex-end",
      gap: 12,
    },
    textarea: {
      flex: 1,
      border: `1px solid ${T.inputBorder}`,
      borderRadius: 12,
      padding: "10px 14px",
      fontSize: 14,
      resize: "none",
      fontFamily: "system-ui, sans-serif",
      background: T.input,
      color: T.text,
      outline: "none",
      maxHeight: 100,
      lineHeight: 1.5,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      border: "none",
      background: T.accent,
      color: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "transform 0.15s, opacity 0.15s",
      opacity: text.trim() ? 1 : 0.4,
    },

    // Empty state
    emptyRight: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: T.muted,
      gap: 12,
    },
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 20px", color: T.text }}>
        Messages
      </h1>

      <div style={S.root}>

        {/* ── Left: Connections list ─────────────────── */}
        <div style={S.left}>
          <div style={S.leftHeader}>
            <p style={S.leftTitle}>Chats</p>
            <p style={S.leftSub}>
              {connections.length} connection{connections.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div style={S.connList}>
            {loading && (
              <p style={{ padding: "20px", color: T.muted, fontSize: 13 }}>
                Loading...
              </p>
            )}

            {!loading && connections.length === 0 && (
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>
                  No connections yet.<br />Go to People to connect!
                </p>
              </div>
            )}

            {connections.map(conn => {
              const isActive  = activeUser?.id === conn.id
              const isTeacher = conn.role === "teacher"
              const last      = lastMessages[conn.id]
              return (
                <div
                  key={conn.id}
                  style={S.connItem(isActive)}
                  onClick={() => setActiveUser(conn)}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = T.hover
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = "transparent"
                  }}
                >
                  <div style={S.avatar(isTeacher)}>
                    {isTeacher ? "🧑‍🏫" : "🎓"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={S.connName}>{conn.name || "Unknown"}</p>
                    <p style={S.connPreview}>
                      {last?.text || (isTeacher ? "Teacher" : conn.department || "Student")}
                    </p>
                  </div>
                  {last?.ts && (
                    <span style={{ fontSize: 10, color: T.muted, flexShrink: 0 }}>
                      {timeAgo(last.ts)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right: Chat window ─────────────────────── */}
        <div style={S.right}>
          {!activeUser ? (
            // Empty state
            <div style={S.emptyRight}>
              <div style={{ fontSize: 56 }}>💬</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: T.text }}>
                Your Messages
              </p>
              <p style={{ fontSize: 13, textAlign: "center", maxWidth: 220, lineHeight: 1.6 }}>
                Select a connection from the left to start chatting
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={S.chatHeader}>
                <div style={S.chatAvatar(activeUser.role === "teacher")}>
                  {activeUser.role === "teacher" ? "🧑‍🏫" : "🎓"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: T.text }}>
                    {activeUser.name || "Unknown"}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: T.muted }}>
                    {activeUser.role === "teacher"
                      ? `${activeUser.designation || "Teacher"}${activeUser.subject ? ` · ${activeUser.subject}` : ""}`
                      : `Student${activeUser.department ? ` · ${activeUser.department}` : ""}`
                    }
                  </p>
                </div>
                <div style={S.onlineDot} title="Online" />
              </div>

              {/* Messages */}
              <div style={S.messagesArea}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", marginTop: 40 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
                    <p style={{ color: T.muted, fontSize: 14 }}>
                      Say hello to {activeUser.name?.split(" ")[0] || "them"}!
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMine    = msg.senderId === uid
                  const prevMsg   = messages[i - 1]
                  const showTime  = !prevMsg || 
                    ((msg.createdAt?.seconds || 0) - (prevMsg.createdAt?.seconds || 0)) > 300

                  return (
                    <div key={msg.id}>
                      {/* Time divider every 5 minutes */}
                      {showTime && msg.createdAt && (
                        <div style={S.dateDivider}>
                          <div style={S.dividerLine} />
                          <span>{timeAgo(msg.createdAt)}</span>
                          <div style={S.dividerLine} />
                        </div>
                      )}
                      <div style={S.bubble(isMine)}>{msg.text}</div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={S.inputArea}>
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`Message ${activeUser.name?.split(" ")[0] || ""}...`}
                  rows={1}
                  style={S.textarea}
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || sending}
                  style={S.sendBtn}
                  title="Send"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}