import React from "react";

/** Assets */
const ZAIN_LOGO_URL = "/zain-logo.png";

/** Types */
type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  tags: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
};

type NewJobInput = {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  type?: string;
  tags?: string | string[];
  description?: string;
  responsibilities?: string | string[];
  requirements?: string | string[];
};

const INITIAL_JOBS: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "ZINC Partners",
    location: "Baghdad, IQ (Hybrid)",
    type: "Full-time",
    tags: ["React","Tailwind","UI"],
    description: "Build and polish user-facing features, collaborate with designers, and ensure high performance across modern browsers.",
    responsibilities: [
      "Develop responsive interfaces using React",
      "Collaborate with product and design on component systems",
      "Write clean, well-tested code and perform code reviews"
    ],
    requirements: [
      "2+ years experience with React",
      "Solid knowledge of HTML/CSS/JS",
      "Familiarity with REST/GraphQL"
    ]
  },
  {
    id: "2",
    title: "Data Analyst",
    company: "Zain Iraq",
    location: "Basra, IQ (On-site)",
    type: "Contract",
    tags: ["SQL","Power BI","Python"],
    description: "Turn data into insights and dashboards that guide leadership decisions. Own data quality and storytelling.",
    responsibilities: [
      "Build reports and dashboards (Power BI/Tableau)",
      "Perform ETL and data validation",
      "Partner with stakeholders to define KPIs"
    ],
    requirements: ["3+ years in analytics","Advanced SQL, basic Python","Data viz portfolio"]
  }
];

const ADMIN_FLAG = "jobfair-admin";

/** Helpers */
function normalizeJob(j: NewJobInput): Job {
  const toList = (s?: string | string[]) =>
    Array.isArray(s) ? s :
    (typeof s === "string" && s ? s.split(/[;\n]/).map(x=>x.trim()).filter(Boolean) : []);

  const toTags = (s?: string | string[]) =>
    Array.isArray(s) ? s :
    (typeof s === "string" && s ? s.split(",").map(x=>x.trim()).filter(Boolean) : []);

  return {
    id: j.id || (typeof crypto !== "undefined" && (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2)),
    title: (j.title || "Untitled role").trim(),
    company: (j.company || "").trim(),
    location: (j.location || "").trim(),
    type: (j.type || "Full-time").trim(),
    tags: toTags(j.tags),
    description: j.description || "",
    responsibilities: toList(j.responsibilities),
    requirements: toList(j.requirements)
  };
}

function useSearch(jobs: Job[], query: string, type: string) {
  return React.useMemo(() => {
    let list = jobs || [];
    if (type && type !== "All") list = list.filter(j => j.type === type);
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(j => [j.title,j.company,j.location,(j.tags||[]).join(" ")].join(" ").toLowerCase().includes(q));
  }, [jobs,query,type]);
}

function isAdmin(): boolean {
  try { return localStorage.getItem(ADMIN_FLAG) === "1"; } catch { return false; }
}
function setAdmin(flag: boolean) {
  try { flag ? localStorage.setItem(ADMIN_FLAG,"1") : localStorage.removeItem(ADMIN_FLAG); } catch {}
}

/** Main App */
export default function App() {
  const [jobs,setJobs] = React.useState<Job[]>(() => {
    try {
      // FIX: Ensure cached jobs are also normalized on load
      const cached = JSON.parse(localStorage.getItem("jobfair-jobs") || "null");
      return Array.isArray(cached) ? cached.map(normalizeJob) : INITIAL_JOBS.map(normalizeJob);
    } catch { return INITIAL_JOBS.map(normalizeJob); }
  });
  const [query,setQuery] = React.useState("");
  const [type,setType] = React.useState("All");
  const [selected,setSelected] = React.useState<Job|null>(null);
  const [submitted,setSubmitted] = React.useState<Record<string,boolean>>({});
  const [admin, setAdminState] = React.useState(isAdmin());
  const [showAdminLogin,setShowAdminLogin] = React.useState(false);
  const [showAdd,setShowAdd] = React.useState(false);

  React.useEffect(()=>{
    try { localStorage.setItem("jobfair-jobs", JSON.stringify(jobs)); } catch {}
  },[jobs]);

  const results = useSearch(jobs, query, type);

  function deleteJob(id:string){
    if (!admin) return;
    if (!confirm("Delete this vacancy?")) return;
    setJobs(prev => prev.filter(j=>j.id!==id));
  }

  return (
    <div>
      <header className="footer">
        <div className="container" style={{display:"flex",gap:12,alignItems:"center",justifyContent:"space-between",padding:"16px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <a href="https://www.iq.zain.com" target="_blank" rel="noopener noreferrer">
              <img src={ZAIN_LOGO_URL} alt="Zain Iraq" style={{height:40}}/>
            </a>
            <h1 style={{margin:0,fontSize:24,fontWeight:800}}>Woman In Tech 2025 - Job Fair</h1>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {!admin ? (
              <button className="btn-outline" onClick={()=>setShowAdminLogin(true)} title="Organizer sign in">Organizer sign in</button>
            ) : (
              <>
                <span className="badge">Admin</span>
                <button className="btn-outline" onClick={()=>{ setAdmin(false); setAdminState(false); }}>Sign out</button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="container" style={{paddingTop:16}}>
        <div className="grid grid-2" style={{gap:12}}>
          <input placeholder="Search by title, company, location, or tag…" value={query} onChange={e=>setQuery(e.target.value)} />
          <select value={type} onChange={e=>setType(e.target.value)}>
            {["All", ...Array.from(new Set((jobs||[]).map(j=>j.type)))].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </section>

      <section className="container" style={{paddingTop:12}}>
        {!admin ? (
          <div className="card muted">Organizers: <button className="btn-outline" onClick={()=>setShowAdminLogin(true)}>sign in</button> to add or delete vacancies.</div>
        ) : (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div className="muted">Admin can add or remove vacancies. Changes are saved locally (no DB).</div>
            <button className="btn" onClick={()=>setShowAdd(true)}>+ Add vacancy</button>
          </div>
        )}
      </section>

      <section className="container" style={{padding:"16px 16px 80px"}}>
        {results.length===0 ? (
          <div className="card muted" style={{textAlign:"center"}}>No vacancies found. Try a different search.</div>
        ) : (
          <div className="grid grid-3">
            {results.map(job => (
              <button key={job.id} className="card" style={{textAlign:"left"}} onClick={()=>setSelected(job)}>
                <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:18}}>{job.title}</div>
                    <div className="muted" style={{marginTop:4,fontSize:14}}>{job.company} • {job.location}</div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span className="pill">{job.type}</span>
                    {admin && <button className="danger" onClick={(e)=>{e.stopPropagation(); deleteJob(job.id);}}>Delete</button>}
                  </div>
                </div>
                <p style={{marginTop:8}}>{job.description}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
                  {(job.tags||[]).map(t => <span key={t} className="btn-outline" style={{fontSize:12,padding:"4px 8px"}}>#{t}</span>)}
                </div>
                {submitted[job.id] && <div style={{marginTop:12}} className="badge">Application submitted</div>}
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && <JobModal job={selected} onClose={()=>setSelected(null)} onSubmitted={(id)=>setSubmitted(s=>({...s,[id]:true}))} />}
      {showAdminLogin && <AdminLoginModal onClose={()=>setShowAdminLogin(false)} onSuccess={()=>{ setAdmin(true); setAdminState(true); setShowAdminLogin(false); }} />}
      {admin && showAdd && <AddVacancyModal onClose={()=>setShowAdd(false)} onSave={(j)=>{ setJobs(prev => [normalizeJob(j), ...prev]); setShowAdd(false); }} />}

      <footer className="footer" style={{marginTop:24}}>
        <div className="container" style={{display:"flex",alignItems:"center",gap:10,padding:"16px 16px"}}>
          <img src={ZAIN_LOGO_URL} alt="Zain Iraq" style={{height:24,opacity:.8}}/>
          <span className="muted">© {new Date().getFullYear()} CER — All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

/** Admin Login Modal */
function AdminLoginModal({ onClose, onSuccess }: { onClose: ()=>void; onSuccess: ()=>void }){
  const [code,setCode] = React.useState("");
  const [error,setError] = React.useState("");

  function submit(e:React.FormEvent){
    e.preventDefault();
    const PASS = (window as any)?.ADMIN_PASSCODE || "ZAIN-ADMIN";
    if (code.trim() === PASS) { setError(""); onSuccess(); }
    else setError("Invalid passcode. Contact organizer.");
  }

  return (
    <div className="modal">
      <div className="backdrop" onClick={onClose} aria-hidden />
      <div className="modal-card" style={{maxWidth:480}}>
        <h2 style={{margin:0,fontWeight:700,fontSize:18}}>Organizer sign in</h2>
        <p className="muted" style={{marginTop:8,fontSize:14}}>Enter the admin passcode to manage vacancies.</p>
        <form onSubmit={submit} style={{marginTop:12,display:"grid",gap:8}}>
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter passcode" />
          {error && <div style={{background:"#fee2e2",color:"#b91c1c",padding:"8px 12px",borderRadius:12,fontSize:14}}>{error}</div>}
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Add Vacancy Modal */
function AddVacancyModal({ onClose, onSave }:{ onClose:()=>void; onSave:(j:NewJobInput)=>void }){
  const [form,setForm] = React.useState({
    title:"", company:"", location:"", type:"Full-time",
    tags:"", description:"", responsibilities:"", requirements:""
  });
  const [error,setError] = React.useState("");

  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(f=>({...f,[k]:e.target.value}));

  function handleSubmit(e:React.FormEvent){
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    setError("");
    onSave({ ...form });
  }

  return (
    <div className="modal">
      <div className="backdrop" onClick={onClose} aria-hidden />
      <div className="modal-card">
        <div className="sticky-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,fontWeight:700,fontSize:20}}>Add Vacancy</h2>
          <button className="btn-outline" onClick={onClose}>Close</button>
        </div>
        <form onSubmit={handleSubmit} style={{display:"grid",gap:12}}>
          <div><label>Title*</label><input value={form.title} onChange={set("title")} placeholder="Backend Developer"/></div>
          <div className="grid grid-2">
            <div><label>Company</label><input value={form.company} onChange={set("company")} placeholder="Zain Iraq"/></div>
            <div><label>Location</label><input value={form.location} onChange={set("location")} placeholder="Baghdad, IQ"/></div>
          </div>
          <div><label>Type</label>
            <select value={form.type} onChange={set("type")}>
              {["Full-time","Part-time","Contract","Internship","Temporary"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label>Tags (comma separated)</label><input value={form.tags} onChange={set("tags")} placeholder="React, Tailwind, UI"/></div>
          <div><label>Description</label><textarea rows={4} value={form.description} onChange={set("description")} /></div>
          <div className="grid grid-2">
            <div><label>Responsibilities (semicolon or new line)</label><textarea rows={4} value={form.responsibilities} onChange={set("responsibilities")} placeholder={"Build dashboards;\\nValidate data"} /></div>
            <div><label>Requirements (semicolon or new line)</label><textarea rows={4} value={form.requirements} onChange={set("requirements")} placeholder={"3+ years SQL;\\nPower BI"} /></div>
          </div>
          {error && <div style={{background:"#fee2e2",color:"#b91c1c",padding:"8px 12px",borderRadius:12,fontSize:14}}>{error}</div>}
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn">Save vacancy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** * Job Modal (Apply)
 * *** MODIFIED TO USE FIREBASE ***
 */
function JobModal({ job, onClose, onSubmitted }:{ job:Job; onClose:()=>void; onSubmitted:(id:string)=>void }){
  const [name,setName] = React.useState("");
  const [email,setEmail] = React.useState("");
  const [phone,setPhone] = React.useState("");
  const [file,setFile] = React.useState<File|null>(null);
  const [error,setError] = React.useState("");
  const [ok,setOk] = React.useState(false);
  const [loading, setLoading] = React.useState(false); // Added loading state

  function validate(): string | null {
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (!file) return "Please attach your CV.";
    return null;
  }

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); setOk(false); return; }
    setError("");
    setLoading(true); // Set loading true

    try {
      // 1) Prepare Form Data for unified API endpoint
      const fd = new FormData();
      fd.append("jobId", job.id);
      fd.append("jobTitle", job.title);
      fd.append("company", job.company);
      fd.append("location", job.location);
      fd.append("type", job.type);
      fd.append("tags", (job.tags || []).join(",")); // Send tags as string
      
      fd.append("name", name);
      fd.append("email", email);
      fd.append("phone", phone);
      fd.append("file", file as File, file!.name); // CV file

      // 2) Send unified request to new Firebase handler
      // NOTE: This calls the single API route /api/apply-job.js
      const resp = await fetch("/api/apply-job", { method: "POST", body: fd });
      
      let data;
      try {
        data = await resp.json();
      } catch (err) {
        throw new Error("Received non-JSON response from server. Check Vercel logs.");
      }
      
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || "Submission failed (Firebase API Error).");
      }

      setOk(true);
      onSubmitted(job.id);
      setName(""); setEmail(""); setPhone(""); setFile(null);
    } catch (err:any) {
      setOk(false);
      setError(err?.message || "Submission failed due to server error.");
    } finally {
      setLoading(false); // Set loading false
    }
  }

  return (
    <div className="modal">
      <div className="backdrop" onClick={onClose} aria-hidden />
      <div className="modal-card">
        <div className="sticky-head" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{margin:0,fontWeight:800,fontSize:20}}>{job.title}</h2>
            <div className="muted" style={{marginTop:4,fontSize:14}}>{job.company} • {job.location} • {job.type}</div>
          </div>
          <button className="btn-outline" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-2">
          <div>
            <p>{job.description}</p>
            {job.responsibilities.length>0 && (<div style={{marginTop:16}}>
              <div style={{fontWeight:700}}>Responsibilities</div>
              <ul>
                {job.responsibilities.map((r,i)=><li key={i}>{r}</li>)}
              </ul>
            </div>)}
            {job.requirements.length>0 && (<div style={{marginTop:16}}>
              <div style={{fontWeight:700}}>Requirements</div>
              <ul>
                {job.requirements.map((r,i)=><li key={i}>{r}</li>)}
              </ul>
            </div>)}
          </div>
          <form onSubmit={handleSubmit} className="card" style={{padding:16}}>
            <div style={{fontWeight:700,marginBottom:8}}>Apply for this role</div>
            {/* MODIFIED: Updated description */}
            <div className="muted" style={{fontSize:14,marginBottom:12}}>Uploads go to Firebase Storage; details are appended to Firebase Firestore.</div>

            <label>Full name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" disabled={loading}/>
            <label style={{marginTop:8}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" disabled={loading}/>
            <label style={{marginTop:8}}>Phone</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+964 …" disabled={loading}/>
            <label style={{marginTop:8}}>CV (PDF / DOCX)</label>
            <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={e=>setFile(e.target.files?.[0] || null)} disabled={loading} />

            {error && <div style={{background:"#fee2e2",color:"#b91c1c",padding:"8px 12px",borderRadius:12,fontSize:14,marginTop:8}}>{error}</div>}
            {ok && <div style={{background:"#ecfdf5",color:"#065f46",padding:"8px 12px",borderRadius:12,fontSize:14,marginTop:8}}>Submitted! Thank you.</div>}

            {/* MODIFIED: Updated button text and disabled state */}
            <button type="submit" className="btn" style={{marginTop:12,width:"100%"}} disabled={loading || ok}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
            <div className="muted" style={{fontSize:12,marginTop:8}}>By submitting, you consent to processing your information for this job opportunity.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
