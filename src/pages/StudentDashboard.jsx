import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  doc, getDoc, getDocs, updateDoc, addDoc, collection,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove
} from "firebase/firestore"
import { auth, db } from "./firebase"
import ChatView from "./ChatView"

// ── Themes ────────────────────────────────────────────────────
const LIGHT = {
  bg:"#F5F0E8", card:"#FFFFFF", sidebar:"#FFFFFF", text:"#1A1A1A",
  muted:"#888", border:"#E8E2D9", accent:"#C1614F", accentLight:"#F9F0EE",
  input:"#FFFFFF", inputBorder:"#E0D8CF", tag:"#F0EBE5", tagText:"#C1614F",
  hover:"#FAF6F1", navActive:"#C1614F", navActiveTxt:"#FFFFFF",
}
const DARK = {
  bg:"#0E0E0E", card:"#1A1A1A", sidebar:"#111111", text:"#F0F0F0",
  muted:"#666", border:"#2C2C2C", accent:"#E07060", accentLight:"#2A1815",
  input:"#222222", inputBorder:"#333333", tag:"#2A2A2A", tagText:"#E07060",
  hover:"#1F1F1F", navActive:"#E07060", navActiveTxt:"#FFFFFF",
}

// ── Icon helper ───────────────────────────────────────────────
const Ico = ({ d, size=18, color="#888" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const I = {
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  feed:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  match:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 11a4 4 0 100-8 4 4 0 000 8z",
  profile:  "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  bell:     "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  heart:    "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  comment:  "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  send:     "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  sun:      "M12 17a5 5 0 100-10 5 5 0 000 10z M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42",
  moon:     "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  trophy:   "M8.21 13.89L7 23l5-3 5 3-1.21-9.12 M15 7a3 3 0 11-6 0 3 3 0 016 0z M17 4H7l1 3h8l1-3z",
  people:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  book:     "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  chat:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  code:     "M16 18l6-6-6-6 M8 6l-6 6 6 6",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  pin:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 11-4 0 2 2 0 014 0",
  connect:  "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
}

function timeAgo(ts) {
  if (!ts) return ""
  const secs = Math.floor((Date.now() - ts.toMillis?.() || 0) / 1000)
  if (secs < 60) return "just now"
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`
  return `${Math.floor(secs/86400)}d ago`
}

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ profile, currentView, setCurrentView, onLogout, T }) {
  const nav = [
    { id:"dashboard", label:"Dashboard", icon:I.home },
    { id:"feed",      label:"Feed",      icon:I.feed },
    { id:"match",     label:"Match",     icon:I.match },
    { id:"profile",   label:"Profile",   icon:I.profile },
    { id:"chat", label:"Messages", icon:I.chat },
    { id:"settings",  label:"Settings",  icon:I.settings },
  ]
  return (
    <div style={{
      width:230, minHeight:"100vh", background:T.sidebar, position:"fixed",
      top:0, left:0, borderRight:`1px solid ${T.border}`,
      display:"flex", flexDirection:"column", padding:"24px 0", zIndex:100,
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 20px 24px" }}>
        <div style={{ width:34, height:34, borderRadius:"50%", border:`2px solid ${T.accent}`,
          display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:T.accent, fontSize:16 }}>C</div>
        <span style={{ fontWeight:700, fontSize:18, color:T.text }}>Conecta</span>
      </div>

      {/* User card */}
      <div style={{ margin:"0 12px 20px", background:T.accentLight, borderRadius:10, padding:"12px 14px",
        display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:T.accent,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🎓</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:600, fontSize:13, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {profile?.name || "Student"}
          </div>
          <div style={{ fontSize:11, color:T.muted }}>Student</div>
        </div>
        <Ico d={I.bell} size={15} color={T.muted} />
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"0 12px" }}>
        {nav.map(item => {
          const active = currentView === item.id
          return (
            <button key={item.id} onClick={() => setCurrentView(item.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:12,
              padding:"10px 14px", borderRadius:8, border:"none", cursor:"pointer",
              background: active ? T.navActive : "transparent",
              color: active ? T.navActiveTxt : T.text,
              fontSize:14, fontWeight: active ? 600 : 400,
              marginBottom:4, textAlign:"left",
            }}>
              <Ico d={item.icon} size={16} color={active ? T.navActiveTxt : T.muted} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Logout button */}
      <div style={{ padding:"12px 12px 0", borderTop:`1px solid ${T.border}` }}>
        <button onClick={onLogout} style={{
          width:"100%", display:"flex", alignItems:"center", gap:12,
          padding:"11px 14px", borderRadius:8, border:`1px solid ${T.border}`,
          cursor:"pointer", background:T.hover, color:T.muted,
          fontSize:14, fontWeight:500, textAlign:"left",
        }}>
          <Ico d={I.logout} size={16} color={T.muted} />
          Logout
        </button>
      </div>
    </div>
  )
}

// ── Dashboard home ────────────────────────────────────────────
function DashboardView({ profile, activity, announcements, T }) {
  const stats = [
   { icon:I.people, val:(profile?.connections||[]).length, label:"Connections" },
    { icon:I.book,   val:profile?.stats?.projects??0,    label:"Projects" },
    { icon:I.chat,   val:profile?.stats?.messages??0,    label:"Messages" },
    { icon:I.trophy, val:profile?.stats?.achievements??0,label:"Achievements" },
  ]
  const typeCol = { Workshop:T.accent, Deadline:"#E05C5C", Meeting:"#4A90D9", Other:T.muted }
  return (
    <div>
      <h1 style={{ fontSize:30, fontWeight:700, margin:"0 0 4px", color:T.text }}>Welcome back! 👋</h1>
      <p style={{ color:T.muted, margin:"0 0 28px", fontSize:14 }}>Here's what's happening in your academic network</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {stats.map((s,i) => (
          <div key={i} style={{ background:T.card, borderRadius:12, padding:"18px 20px", border:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:T.accentLight, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ico d={s.icon} size={18} color={T.accent} />
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color:T.text }}>{s.val}</div>
              <div style={{ fontSize:11, color:T.muted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>
        <div style={{ background:T.card, borderRadius:12, padding:24, border:`1px solid ${T.border}` }}>
          <h2 style={{ margin:"0 0 18px", fontSize:15, fontWeight:600, color:T.text }}>Recent Activity</h2>
          {activity.length===0
            ? <p style={{ color:T.muted, fontSize:14 }}>No activity yet. Start connecting!</p>
            : activity.map((a,i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:i<activity.length-1?`1px solid ${T.border}`:"none" }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background:T.accentLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{a.avatar||"👤"}</div>
                <div>
                  <p style={{ margin:"0 0 2px", fontSize:13, color:T.text, lineHeight:1.4 }}><strong>{a.actor}</strong> {a.action}</p>
                  <span style={{ fontSize:11, color:T.muted }}>{timeAgo(a.timestamp)}</span>
                </div>
              </div>
            ))
          }
        </div>
        <div style={{ background:T.card, borderRadius:12, padding:24, border:`1px solid ${T.border}` }}>
          <h2 style={{ margin:"0 0 18px", fontSize:15, fontWeight:600, color:T.text }}>📅 Upcoming</h2>
          {announcements.length===0
            ? <p style={{ color:T.muted, fontSize:14 }}>No upcoming events.</p>
            : announcements.map((a,i) => {
              const col = typeCol[a.type]||T.muted
              return (
                <div key={i} style={{ borderLeft:`3px solid ${col}`, paddingLeft:12, marginBottom:14 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:col, textTransform:"uppercase", background:`${col}20`, padding:"2px 6px", borderRadius:4, display:"inline-block", marginBottom:4 }}>{a.type}</span>
                  <p style={{ margin:"0 0 1px", fontSize:13, fontWeight:600, color:T.text }}>{a.title}</p>
                  <p style={{ margin:0, fontSize:11, color:T.muted }}>{a.date}{a.time?` • ${a.time}`:""}</p>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

// ── Feed ──────────────────────────────────────────────────────
function FeedView({ profile, uid, T }) {
  const [posts, setPosts]   = useState([])
  const [text, setText]     = useState("")
  const [posting, setPosting] = useState(false)
  const [filter, setFilter] = useState("all") // all | announcements | posts
  const [search, setSearch] = useState("")
   const [myPosts, setMyPosts] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "posts"), snap => {
      const data = snap.docs.map(d => ({ id:d.id, ...d.data() }))
        .sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
      setPosts(data)
    })
    return () => unsub()
  }, [])

  const handlePost = async () => {
    if (!text.trim()) return
    setPosting(true)
    try {
      await addDoc(collection(db, "posts"), {
        content:    text.trim(),
        authorId:   uid,
        authorName: profile?.name || "Student",
        authorRole: "student",
        type:       "post",
        likes:      [],
        createdAt:  serverTimestamp(),
      })
      await addDoc(collection(db, "users", uid, "activity"), {
      actor:     profile?.name || "You",
      action:    "shared a new post on the feed",
      avatar:    "📝",
      timestamp: serverTimestamp(),
})
      setText("")
    } catch(e) { console.error(e) }
    setPosting(false)
  }

  const toggleLike = async (postId, likes=[]) => {
    const liked = likes.includes(uid)
    await updateDoc(doc(db, "posts", postId), {
      likes: liked ? arrayRemove(uid) : arrayUnion(uid)
    })
  }

  const filtered = posts.filter(p => {
  if (p.deleted) return false
  if (myPosts && p.authorId !== uid) return false
  if (search && !p.content?.toLowerCase().includes(search.toLowerCase()) &&
      !p.authorName?.toLowerCase().includes(search.toLowerCase())) return false
  if (filter==="all") return true
  if (filter==="announcement") return p.type==="announcement"
  if (filter==="post") return p.type==="post"
  return true
})

  return (
    <div style={{ maxWidth:640 }}>
      <h1 style={{ fontSize:26, fontWeight:700, margin:"0 0 20px", color:T.text }}>Feed</h1>

      {/* Compose */}
      <div style={{ background:T.card, borderRadius:14, padding:20, border:`1px solid ${T.border}`, marginBottom:20 }}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🎓</div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Share something with your academic network..."
            rows={3}
            style={{ flex:1, border:`1px solid ${T.inputBorder}`, borderRadius:10, padding:"10px 12px",
              fontSize:14, resize:"none", fontFamily:"inherit", background:T.input, color:T.text,
              outline:"none", boxSizing:"border-box" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
          <button onClick={handlePost} disabled={posting||!text.trim()} style={{
            background:text.trim()?T.accent:"#ccc", color:"#fff", border:"none",
            borderRadius:8, padding:"8px 20px", cursor:text.trim()?"pointer":"not-allowed",
            fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6,
          }}>
            <Ico d={I.send} size={14} color="#fff" />
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ position:"relative", marginBottom:14 }}>
  <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
    width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
  </svg>
  <input
    value={search}
    onChange={e => setSearch(e.target.value)}
    placeholder="Search posts..."
    style={{
      width:"100%", border:`1px solid ${T.inputBorder}`,
      borderRadius:10, padding:"10px 12px 10px 36px",
      fontSize:14, background:T.input, color:T.text,
      outline:"none", boxSizing:"border-box",
    }}
  />
</div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[["all","All Posts"],["post","Student Posts"],["announcement","Announcements"]].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding:"6px 14px", borderRadius:20, border:`1px solid ${filter===val?T.accent:T.border}`,
            background:filter===val?T.accent:"transparent", color:filter===val?"#fff":T.muted,
            fontSize:12, cursor:"pointer", fontWeight:filter===val?600:400,
          }}>{label}</button>
        ))}
          <button onClick={() => setMyPosts(p=>!p)} style={{
          padding:"6px 14px", borderRadius:20, border:`1px solid ${myPosts?T.warm:T.border}`,
          background:myPosts?T.warm:"transparent", color:myPosts?"#fff":T.muted,
          fontSize:12, cursor:"pointer", fontWeight:myPosts?600:400, marginLeft:"auto",
        }}>My Posts Only</button>
      </div>

      {/* Posts */}
      {filtered.length===0 && <p style={{ color:T.muted, fontSize:14 }}>No posts yet. Be the first to post!</p>}
      {filtered.map(post => {
        const liked = (post.likes||[]).includes(uid)
        const isAnn = post.type==="announcement"
        return (
          <div key={post.id} style={{ background:T.card, borderRadius:14, padding:20, border:`1px solid ${T.border}`, marginBottom:16 }}>
            {isAnn && (
              <span style={{ fontSize:10, fontWeight:700, color:T.accent, textTransform:"uppercase", background:T.accentLight, padding:"2px 8px", borderRadius:4, display:"inline-block", marginBottom:10 }}>📢 Announcement</span>
            )}
            <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:isAnn?"#2D3B8E":T.accentLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                {isAnn?"🧑‍🏫":"🎓"}
              </div>
              <div>
                <p style={{ margin:"0 0 1px", fontWeight:600, fontSize:14, color:T.text }}>{post.authorName}</p>
                <p style={{ margin:0, fontSize:11, color:T.muted }}>{post.authorRole==="teacher"?"Teacher":"Student"} • {timeAgo(post.createdAt)}</p>
              </div>
            </div>
            <p style={{ margin:"0 0 14px", fontSize:14, color:T.text, lineHeight:1.6 }}>{post.content}</p>
            <div style={{ display:"flex", gap:16, paddingTop:12, borderTop:`1px solid ${T.border}` }}>
              <button onClick={() => toggleLike(post.id, post.likes)} style={{
                display:"flex", alignItems:"center", gap:5, background:"none", border:"none",
                cursor:"pointer", color:liked?T.accent:T.muted, fontSize:13,
              }}>
                
                <Ico d={I.heart} size={15} color={liked?T.accent:T.muted} />
                {(post.likes||[]).length} {(post.likes||[]).length===1?"Like":"Likes"}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Match / Discover ─────────────────────────────────────────
function MatchView({ profile, uid, T }) {
  const [users, setUsers]   = useState([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all") // all | teacher | student
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(new Set())
  const [aiResults, setAiResults]   = useState(null)  // null = not searched yet
const [aiLoading, setAiLoading]   = useState(false)
const [aiQuery, setAiQuery]       = useState("")
const handleAiSearch = async () => {
  if (!aiQuery.trim() || !users.length) return
  setAiLoading(true)
  setAiResults(null)

  // Simulate thinking time for UX
  await new Promise(r => setTimeout(r, 800))

  const query = aiQuery.toLowerCase()
  const keywords = query.split(" ").filter(w => w.length > 2)

  const scored = users.map(u => {
    let score = 0
    const reasons = []

    const searchable = [
      u.name, u.role, u.department, u.bio,
      u.designation, u.subject, u.semester,
      ...(u.interests || []),
      ...(u.skills || []).map(s => s.name),
    ].filter(Boolean).map(s => s.toLowerCase())

    keywords.forEach(keyword => {
      searchable.forEach(field => {
        if (field.includes(keyword)) {
          score += 2
        }
      })
    })

    // Role match bonus
    if (query.includes("teacher") && u.role === "teacher") {
      score += 5
      reasons.push(`Teacher${u.subject ? ` specializing in ${u.subject}` : ""}`)
    }
    if (query.includes("student") && u.role === "student") {
      score += 5
      reasons.push(`Student${u.department ? ` from ${u.department}` : ""}`)
    }

    // Department match
    if (u.department && query.includes(u.department.toLowerCase())) {
      score += 4
      reasons.push(`From ${u.department} department`)
    }

    // Skills match
    const matchedSkills = (u.skills || [])
      .filter(s => keywords.some(k => s.name?.toLowerCase().includes(k)))
      .map(s => s.name)
    if (matchedSkills.length > 0) {
      score += matchedSkills.length * 3
      reasons.push(`Knows ${matchedSkills.join(", ")}`)
    }

    // Interests match
    const matchedInterests = (u.interests || [])
      .filter(i => keywords.some(k => i.toLowerCase().includes(k)))
    if (matchedInterests.length > 0) {
      score += matchedInterests.length * 2
      reasons.push(`Interested in ${matchedInterests.join(", ")}`)
    }

    // Bio match
    if (u.bio && keywords.some(k => u.bio.toLowerCase().includes(k))) {
      score += 2
      reasons.push("Profile matches your search")
    }

    const matchReason = reasons.length > 0
      ? reasons.join(" · ")
      : `Matches based on profile keywords`

    return { ...u, score, matchReason }
  })

  const results = scored
    .filter(u => u.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  setAiResults(results)
  setAiLoading(false)
}
  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      const all = snap.docs.filter(d => d.id!==uid).map(d => ({ id:d.id, ...d.data() }))
      setUsers(all)
      setLoading(false)
    })
    // Load existing connections from profile
    if (profile?.connections) setConnected(new Set(profile.connections))
  }, [uid, profile])

  const handleConnect = async (targetId,u) => {
    const already = connected.has(targetId)
    const newSet = new Set(connected)
    if (already) newSet.delete(targetId); else newSet.add(targetId)
    setConnected(newSet)
    await updateDoc(doc(db, "users", uid), { connections: [...newSet] })
    await addDoc(collection(db, "users", uid, "activity"), {
  actor:   profile?.name || "You",
  action:  already ? `disconnected from ${u?.name||"someone"}` : `connected with ${u?.name||"someone"}`,
  avatar:  "🤝",
  timestamp: serverTimestamp(),
})
  }

  const filtered = users.filter(u => {
    if (filter!=="all" && u.role!==filter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q) ||
      (u.interests||[]).some(i => i.toLowerCase().includes(q)) ||
      (u.skills||[]).some(s => s.name?.toLowerCase().includes(q))
    )
  })

  return (
    <div>
      <h1 style={{ fontSize:26, fontWeight:700, margin:"0 0 6px", color:T.text }}>Discover People</h1>
      <p style={{ color:T.muted, fontSize:14, margin:"0 0 24px" }}>Connect with students and teachers on the platform</p>
       {/* AI Search */}
<div style={{
  background: T.card, border:`1px solid ${T.border}`,
  borderRadius:14, padding:20, marginBottom:24,
}}>
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
    <span style={{ fontSize:18 }}>✨</span>
    <p style={{ margin:0, fontWeight:600, fontSize:14, color:T.text }}>AI Profile Match</p>
    <span style={{ fontSize:11, background:T.accentLight, color:T.accent,
      padding:"2px 8px", borderRadius:10, fontWeight:600 }}>Beta</span>
  </div>
  <p style={{ margin:"0 0 12px", fontSize:13, color:T.muted }}>
    Describe who you're looking for in plain words
  </p>
  <div style={{ display:"flex", gap:10 }}>
    <input
      value={aiQuery}
      onChange={e => setAiQuery(e.target.value)}
      onKeyDown={e => e.key==="Enter" && handleAiSearch()}
      placeholder='e.g. "physics teacher for extra classes" or "React developer for project"'
      style={{
        flex:1, border:`1px solid ${T.inputBorder}`, borderRadius:10,
        padding:"10px 14px", fontSize:14, background:T.input,
        color:T.text, outline:"none",
      }}
    />
    <button onClick={handleAiSearch} disabled={aiLoading || !aiQuery.trim()} style={{
      background: aiQuery.trim() ? T.accent : "#ccc",
      color:"#fff", border:"none", borderRadius:10,
      padding:"10px 20px", cursor: aiQuery.trim() ? "pointer" : "not-allowed",
      fontSize:13, fontWeight:600, whiteSpace:"nowrap",
    }}>
      {aiLoading ? "Matching..." : "✨ Match"}
    </button>
  </div>
</div>
{/* AI Results */}
{aiResults !== null && (
  <div style={{ marginBottom:24 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
      <p style={{ margin:0, fontWeight:700, fontSize:14, color:T.text }}>
        ✨ AI Matched {aiResults.length} profile{aiResults.length!==1?"s":""}
      </p>
      <button onClick={() => { setAiResults(null); setAiQuery("") }} style={{
        background:"none", border:"none", color:T.muted,
        fontSize:12, cursor:"pointer",
      }}>
        Clear ×
      </button>
    </div>

    {aiResults.length === 0 && (
      <p style={{ color:T.muted, fontSize:14 }}>No strong matches found. Try different keywords.</p>
    )}

    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
      {aiResults.map(u => {
        const isConn    = connected.has(u.id)
        const isTeacher = u.role === "teacher"
        return (
          <div key={u.id} style={{
            background:T.card, borderRadius:14, padding:20,
            border:`2px solid ${T.accent}`,  // highlighted border for AI results
            position:"relative",
          }}>
            {/* AI match badge */}
            <div style={{
              position:"absolute", top:12, right:12,
              fontSize:10, fontWeight:700, color:T.accent,
              background:T.accentLight, padding:"2px 8px", borderRadius:10,
            }}>✨ AI Match</div>

            <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
              <div style={{
                width:44, height:44, borderRadius:12, flexShrink:0,
                background: isTeacher ? "#2D3B8E" : T.accentLight,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
              }}>
                {isTeacher ? "🧑‍🏫" : "🎓"}
              </div>
              <div>
                <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:14, color:T.text }}>{u.name}</p>
                <span style={{
                  fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:10,
                  color: isTeacher ? "#2D3B8E" : T.accent,
                  background: isTeacher ? "#EEF0FF" : T.accentLight,
                }}>{isTeacher ? "Teacher" : "Student"}</span>
              </div>
            </div>

            {/* Match reason — this is the AI explanation */}
            <div style={{
              background:T.accentLight, borderRadius:8,
              padding:"8px 12px", marginBottom:12,
            }}>
              <p style={{ margin:0, fontSize:12, color:T.accent, lineHeight:1.5 }}>
                💡 {u.matchReason}
              </p>
            </div>

            <button onClick={() => handleConnect(u.id, u)} style={{
              width:"100%", padding:"8px", borderRadius:8,
              cursor:"pointer", fontSize:13, fontWeight:600,
              border:`1px solid ${isConn ? T.border : T.accent}`,
              background: isConn ? "transparent" : T.accent,
              color: isConn ? T.muted : "#fff",
            }}>
              {isConn ? "✓ Connected" : "+ Connect"}
            </button>
          </div>
        )
      })}
    </div>
  </div>
)}
      {/* Search + filter */}
      <div style={{ display:"flex", gap:12, marginBottom:24, alignItems:"center" }}>
        <div style={{ flex:1, position:"relative" }}>
          <Ico d={I.search} size={16} color={T.muted} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, department, skill, or interest..."
            style={{ width:"100%", border:`1px solid ${T.inputBorder}`, borderRadius:10, padding:"10px 12px 10px 36px",
              fontSize:14, background:T.input, color:T.text, boxSizing:"border-box", outline:"none" }} />
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[["all","Everyone"],["teacher","Teachers"],["student","Students"]].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding:"8px 14px", borderRadius:8, border:`1px solid ${filter===val?T.accent:T.border}`,
              background:filter===val?T.accent:"transparent", color:filter===val?"#fff":T.muted,
              fontSize:12, cursor:"pointer", fontWeight:filter===val?600:400, whiteSpace:"nowrap",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color:T.muted }}>Loading profiles...</p>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
        {filtered.map(u => {
          const isConn = connected.has(u.id)
          const isTeacher = u.role==="teacher"
          return (
            <div key={u.id} style={{ background:T.card, borderRadius:14, padding:20, border:`1px solid ${T.border}` }}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:isTeacher?"#2D3B8E":T.accentLight,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                  {isTeacher?"🧑‍🏫":"🎓"}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:14, color:T.text }}>{u.name||"Unknown"}</p>
                  <span style={{ fontSize:11, fontWeight:600, color:isTeacher?"#2D3B8E":T.accent,
                    background:isTeacher?"#EEF0FF":T.accentLight, padding:"2px 8px", borderRadius:10 }}>
                    {isTeacher?"Teacher":"Student"}
                  </span>
                </div>
              </div>

              {u.department && (
                <p style={{ margin:"0 0 6px", fontSize:12, color:T.muted, display:"flex", alignItems:"center", gap:4 }}>
                  <Ico d={I.book} size={12} color={T.muted} /> {u.department}
                  {u.semester ? ` · ${u.semester}` : ""}
                </p>
              )}
              {u.bio && (
                <p style={{ margin:"0 0 10px", fontSize:13, color:T.text, lineHeight:1.5,
                  overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                  {u.bio}
                </p>
              )}
              {(u.interests||[]).length>0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
                  {u.interests.slice(0,3).map((item,i) => (
                    <span key={i} style={{ fontSize:11, background:T.tag, color:T.tagText, borderRadius:10, padding:"2px 8px" }}>
                      {item}
                    </span>
                  ))}
                </div>
              )}
              <button onClick={() => handleConnect(u.id)} style={{
                width:"100%", padding:"8px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600,
                border:`1px solid ${isConn?T.border:T.accent}`,
                background:isConn?"transparent":T.accent,
                color:isConn?T.muted:"#fff",
              }}>
                {isConn?"✓ Connected":"+ Connect"}
              </button>
            </div>
          )
        })}
        {!loading && filtered.length===0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"40px 0", color:T.muted }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
            <p style={{ fontSize:14 }}>No profiles match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Profile ───────────────────────────────────────────────────
function ProfileView({ profile, uid, onProfileUpdate, T }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ name:"", bio:"", location:"", department:"", semester:"", interests:"", skills:[] })

  useEffect(() => {
    if (profile) setForm({
      name:       profile.name||"",
      bio:        profile.bio||"",
      location:   profile.location||"",
      department: profile.department||"",
      semester:   profile.semester||"",
      interests:  (profile.interests||[]).join(", "),
      skills:     Array.isArray(profile.skills)?profile.skills:[],
    })
  }, [profile])

  const save = async () => {
    if (!uid) return
    setSaving(true)
    try {
      const updated = {
        name:       form.name,
        bio:        form.bio,
        location:   form.location,
        department: form.department,
        semester:   form.semester,
        interests:  form.interests.split(",").map(s=>s.trim()).filter(Boolean),
        skills:     form.skills,
      }
      await updateDoc(doc(db,"users",uid), updated)
      onProfileUpdate(updated)
      setEditing(false)
    } catch(e) { alert("Save failed: "+e.message) }
    setSaving(false)
  }

  const updateSkill = (i,field,val) => {
    const s=[...form.skills]; s[i]={...s[i],[field]:val}; setForm(f=>({...f,skills:s}))
  }

  const skills   = editing ? form.skills : (profile?.skills||[])
  const interests= profile?.interests||[]

  return (
    <div>
      <div style={{ background:T.accent, borderRadius:14, padding:"28px 32px", display:"flex", alignItems:"center", gap:24, marginBottom:24, position:"relative" }}>
        <div style={{ width:78, height:78, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, flexShrink:0 }}>🎓</div>
        <div style={{ flex:1 }}>
          <h1 style={{ color:"#fff", margin:"0 0 4px", fontSize:26, fontWeight:700 }}>{profile?.name||"Your Name"}</h1>
          <p style={{ color:"rgba(255,255,255,0.7)", margin:"0 0 8px", fontSize:13 }}>
            @{(profile?.name||"").toLowerCase().replace(/\s+/g,"")||"username"}
          </p>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            {profile?.email && <span style={{ color:"rgba(255,255,255,0.85)", fontSize:12, display:"flex", alignItems:"center", gap:4 }}><Ico d={I.mail} size={12} color="rgba(255,255,255,0.85)" />{profile.email}</span>}
            {profile?.location && <span style={{ color:"rgba(255,255,255,0.85)", fontSize:12, display:"flex", alignItems:"center", gap:4 }}><Ico d={I.pin} size={12} color="rgba(255,255,255,0.85)" />{profile.location}</span>}
          </div>
        </div>
        <button onClick={()=>setEditing(e=>!e)} style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.4)", color:"#fff", borderRadius:8, padding:"8px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:500 }}>
          <Ico d={I.edit} size={13} color="#fff" /> {editing?"Cancel":"Edit Profile"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* About */}
          <div style={{ background:T.card, borderRadius:12, padding:24, border:`1px solid ${T.border}` }}>
            <h3 style={{ margin:"0 0 12px", fontSize:15, fontWeight:600, color:T.text }}>About</h3>
            {editing
              ? <textarea value={form.bio} rows={3} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="Tell others about yourself..."
                  style={{ width:"100%", border:`1px solid ${T.inputBorder}`, borderRadius:8, padding:"10px 12px", fontSize:14, resize:"vertical", fontFamily:"inherit", background:T.input, color:T.text, boxSizing:"border-box" }} />
              : <p style={{ margin:0, color:profile?.bio?T.text:T.muted, fontSize:14, lineHeight:1.6 }}>{profile?.bio||"Add a bio."}</p>
            }
          </div>

          {/* Skills */}
          <div style={{ background:T.card, borderRadius:12, padding:24, border:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:600, color:T.text, display:"flex", alignItems:"center", gap:8 }}><Ico d={I.code} size={15} color={T.accent} />Skills</h3>
              {editing && <button onClick={()=>setForm(f=>({...f,skills:[...f.skills,{name:"",level:50}]}))} style={{ background:T.accent, color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontSize:12 }}>+ Add</button>}
            </div>
            {skills.length===0 && <p style={{ color:T.muted, fontSize:13 }}>No skills yet.</p>}
            {skills.map((sk,i) => (
              <div key={i} style={{ marginBottom:14 }}>
                {editing
                  ? <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5 }}>
                      <input value={sk.name} onChange={e=>updateSkill(i,"name",e.target.value)} placeholder="Skill name" style={{ flex:1, border:`1px solid ${T.inputBorder}`, borderRadius:6, padding:"6px 10px", fontSize:13, background:T.input, color:T.text }} />
                      <input type="number" value={sk.level} min={0} max={100} onChange={e=>updateSkill(i,"level",Number(e.target.value))} style={{ width:58, border:`1px solid ${T.inputBorder}`, borderRadius:6, padding:"6px 8px", fontSize:13, textAlign:"center", background:T.input, color:T.text }} />
                      <button onClick={()=>setForm(f=>({...f,skills:f.skills.filter((_,idx)=>idx!==i)}))} style={{ background:"none", border:"none", cursor:"pointer", color:"#E05C5C", fontSize:18 }}>×</button>
                    </div>
                  : <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:14, color:T.text }}>{sk.name}</span>
                      <span style={{ fontSize:13, color:T.muted }}>{sk.level}%</span>
                    </div>
                }
                <div style={{ height:6, background:T.border, borderRadius:99 }}>
                  <div style={{ height:"100%", width:`${sk.level}%`, background:T.accent, borderRadius:99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Details */}
          <div style={{ background:T.card, borderRadius:12, padding:20, border:`1px solid ${T.border}` }}>
            <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:600, color:T.text }}>Details</h3>
            {editing
              ? [["Full Name","name","Your full name"],["Semester","semester","e.g. 6th Semester"],["Department","department","e.g. CSE"],["Location","location","e.g. Jaipur"]].map(([label,key,ph])=>(
                <div key={key} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, color:T.muted, display:"block", marginBottom:3 }}>{label}</label>
                  <input value={form[key]} placeholder={ph} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    style={{ width:"100%", border:`1px solid ${T.inputBorder}`, borderRadius:6, padding:"7px 10px", fontSize:13, background:T.input, color:T.text, boxSizing:"border-box" }} />
                </div>
              ))
              : [["Semester",profile?.semester],["Department",profile?.department]].map(([label,val])=>(
                <div key={label} style={{ marginBottom:12 }}>
                  <p style={{ margin:"0 0 2px", fontSize:11, color:T.muted }}>{label}</p>
                  <p style={{ margin:0, fontWeight:600, fontSize:14, color:T.text }}>{val||"—"}</p>
                </div>
              ))
            }
          </div>

          {/* Interests */}
          <div style={{ background:T.card, borderRadius:12, padding:20, border:`1px solid ${T.border}` }}>
            <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:600, color:T.text, display:"flex", alignItems:"center", gap:6 }}><Ico d={I.star} size={13} color={T.accent} />Interests</h3>
            {editing
              ? <input value={form.interests} onChange={e=>setForm(f=>({...f,interests:e.target.value}))} placeholder="AI, React, Hackathons"
                  style={{ width:"100%", border:`1px solid ${T.inputBorder}`, borderRadius:6, padding:"7px 10px", fontSize:13, background:T.input, color:T.text, boxSizing:"border-box" }} />
              : <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {interests.length===0
                    ? <p style={{ color:T.muted, fontSize:13, margin:0 }}>None added.</p>
                    : interests.map((item,i)=>(
                      <span key={i} style={{ background:T.tag, color:T.tagText, borderRadius:20, padding:"4px 10px", fontSize:12, fontWeight:500 }}>{item}</span>
                    ))
                  }
                </div>
            }
          </div>

          {/* Achievements */}
          <div style={{ background:T.accent, borderRadius:12, padding:20 }}>
            <h3 style={{ margin:"0 0 10px", fontSize:14, fontWeight:600, color:"#fff", display:"flex", alignItems:"center", gap:6 }}><Ico d={I.trophy} size={13} color="#fff" />Achievements</h3>
            {(profile?.achievements||[]).length===0
              ? <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, margin:0 }}>Earn achievements by engaging!</p>
              : (profile.achievements).map((a,i)=><p key={i} style={{ margin:"0 0 5px", color:"rgba(255,255,255,0.85)", fontSize:13 }}>🏆 {a}</p>)
            }
          </div>

          {editing && (
            <button onClick={save} disabled={saving} style={{ background:T.accent, color:"#fff", border:"none", borderRadius:10, padding:"12px", cursor:saving?"not-allowed":"pointer", fontSize:14, fontWeight:600, opacity:saving?0.7:1 }}>
              {saving?"Saving...":"Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Settings ─────────────────────────────────────────────────
function SettingsView({ profile, uid, dark, setDark, onProfileUpdate, T }) {
  const [name, setName]       = useState(profile?.name||"")
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => { setName(profile?.name||"") }, [profile])

  const saveName = async () => {
    if (!uid||!name.trim()) return
    setSaving(true)
    try {
      await updateDoc(doc(db,"users",uid),{ name:name.trim() })
      onProfileUpdate({ name:name.trim() })
      setSaved(true); setTimeout(()=>setSaved(false),2500)
    } catch(e) { alert("Failed: "+e.message) }
    setSaving(false)
  }

  const row = (label, children) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 0", borderBottom:`1px solid ${T.border}` }}>
      <span style={{ fontSize:14, fontWeight:500, color:T.text }}>{label}</span>
      {children}
    </div>
  )

  return (
    <div style={{ maxWidth:540 }}>
      <h1 style={{ fontSize:26, fontWeight:700, margin:"0 0 6px", color:T.text }}>Settings</h1>
      <p style={{ color:T.muted, fontSize:14, margin:"0 0 28px" }}>Manage your account and preferences</p>

      {/* Account */}
      <div style={{ background:T.card, borderRadius:14, padding:"0 24px", border:`1px solid ${T.border}`, marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:T.muted, textTransform:"uppercase", padding:"18px 0 0" }}>Account</p>
        {row("Display Name",
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input value={name} onChange={e=>setName(e.target.value)}
              style={{ border:`1px solid ${T.inputBorder}`, borderRadius:8, padding:"7px 12px", fontSize:13, background:T.input, color:T.text, width:180 }} />
            <button onClick={saveName} disabled={saving} style={{ background:T.accent, color:"#fff", border:"none", borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
              {saving?"...":saved?"✓ Saved":"Save"}
            </button>
          </div>
        )}
        {row("Email", <span style={{ fontSize:13, color:T.muted }}>{profile?.email||"—"}</span>)}
        {row("Role",  <span style={{ fontSize:13, fontWeight:600, color:T.accent, background:T.accentLight, padding:"3px 10px", borderRadius:10 }}>Student</span>)}
      </div>

      {/* Appearance */}
      <div style={{ background:T.card, borderRadius:14, padding:"0 24px", border:`1px solid ${T.border}`, marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:T.muted, textTransform:"uppercase", padding:"18px 0 0" }}>Appearance</p>
        {row("Dark Mode",
          <button onClick={()=>setDark(d=>!d)} style={{
            width:48, height:26, borderRadius:13, border:"none", cursor:"pointer", position:"relative",
            background:dark?T.accent:"#ccc", transition:"background 0.2s",
          }}>
            <div style={{ position:"absolute", top:3, left:dark?24:3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
          </button>
        )}
        {row("Theme", <span style={{ fontSize:13, color:T.muted }}>{dark?"Dark":"Light"}</span>)}
      </div>

      {/* About */}
      <div style={{ background:T.card, borderRadius:14, padding:"0 24px", border:`1px solid ${T.border}` }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:T.muted, textTransform:"uppercase", padding:"18px 0 0" }}>About</p>
        {row("App", <span style={{ fontSize:13, color:T.muted }}>Conecta v1.0</span>)}
        {row("Platform", <span style={{ fontSize:13, color:T.muted }}>Firebase + React</span>)}
        <div style={{ paddingBottom:18 }} />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function StudentDashboard() {
  const [view, setView]               = useState("dashboard")
  const [user, setUser]               = useState(null)
  const [profile, setProfile]         = useState(null)
  const [activity, setActivity]       = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]         = useState(true)
  const [dark, setDark]               = useState(() => localStorage.getItem("conecta_theme")==="dark")
  const navigate = useNavigate()

  const T = dark ? DARK : LIGHT

  useEffect(() => {
    localStorage.setItem("conecta_theme", dark?"dark":"light")
    document.body.style.background = T.bg
  }, [dark, T.bg])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) { navigate("/"); return }
      
      try {
        const snap = await getDoc(doc(db,"users",fu.uid))
        const data = snap.exists() ? snap.data() : {}
        if (data.role && data.role!=="student") { navigate("/dashboard/teacher"); return }
        setUser(fu)
        setProfile({ ...data, email:fu.email })
        try {
          const aSnap = await getDocs(collection(db,"announcements"))
          setAnnouncements(aSnap.docs.map(d=>d.data()).sort((a,b)=>(a.date||"").localeCompare(b.date||"")).slice(0,5))
        } catch(e) { console.error(e) }
        try {
          const actSnap = await getDocs(collection(db,"users",fu.uid,"activity"))
          setActivity(actSnap.docs.map(d=>d.data()).slice(0,5))
        } catch(e) { console.error(e) }
      } catch(e) { console.error(e) }
      setLoading(false)
    })
    return ()=>unsub()
  }, [navigate])

  const logout = async () => { try { await signOut(auth) } catch(e){console.error(e)} navigate("/") }
  const updateProfile = u => setProfile(p=>({...p,...u}))

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:T.bg }}>
      <div style={{ textAlign:"center" }}><div style={{ fontSize:36, marginBottom:12 }}>⏳</div><p style={{ color:T.muted }}>Loading...</p></div>
    </div>
  )

  const views = {
    dashboard: <DashboardView profile={profile} activity={activity} announcements={announcements} T={T} />,
    feed:      <FeedView profile={profile} uid={user?.uid} T={T} />,
    match:     <MatchView profile={profile} uid={user?.uid} T={T} />,
    profile:   <ProfileView profile={profile} uid={user?.uid} onProfileUpdate={updateProfile} T={T} />,
    settings:  <SettingsView profile={profile} uid={user?.uid} dark={dark} setDark={setDark} onProfileUpdate={updateProfile} T={T} />,
    chat: <ChatView profile={profile} uid={user?.uid} T={T} />,
    }


  return (
    
    <div style={{ display:"flex", background:T.bg, minHeight:"100vh", fontFamily:"system-ui,sans-serif" }}>
      <Sidebar profile={profile} currentView={view} setCurrentView={setView} onLogout={logout} T={T} />
      <main style={{ marginLeft:230, flex:1, padding:"36px 40px", minHeight:"100vh" }}>
        {views[view]}
      </main>
    </div>
  )
}