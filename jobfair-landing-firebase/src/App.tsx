import React, { useState, useEffect, useMemo, FormEvent, ChangeEvent } from "react";

/** ---- Assets ----
 * Put your Zain logo at /public/zain-logo.png (or edit this path).
 */
const ZAIN_LOGO_URL = "/zain-logo.png";

/** ---- Demo data (you can delete/replace) ---- */
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

const INITIAL_JOBS: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "ZINC Partners",
    location: "Baghdad, IQ (Hybrid)",
    type: "Full-time",
    tags: ["React", "Tailwind", "UI", "TypeScript"],
    description:
      "Build and polish user-facing features, collaborate with designers, and ensure high performance across modern browsers.",
    responsibilities: [
      "Develop responsive interfaces using React and TailwindCSS",
      "Collaborate with product and design on component systems",
      "Write clean, well-tested code and perform code reviews",
    ],
    requirements: [
      "2+ years experience with React",
      "Solid knowledge of HTML/CSS/JS",
      "Familiarity with REST/GraphQL APIs",
    ],
  },
  {
    id: "2",
    title: "Cloud Data Engineer",
    company: "Zain Iraq",
    location: "Erbil, IQ (Hybrid)",
    type: "Full-time",
    tags: ["Azure", "SQL", "Python", "Data Lakes"],
    description:
      "Design, construct, and maintain data pipelines using cloud services to support advanced analytics and machine learning models.",
    responsibilities: [
      "Develop scalable ETL processes in Azure/AWS/GCP",
      "Ensure data quality and governance standards are met",
      "Optimize data architecture for speed and cost efficiency",
    ],
    requirements: [
      "4+ years in data engineering",
      "Expertise in cloud data warehousing (e.g., Snowflake, Azure SQL)",
      "Strong Python/SQL skills",
    ],
  },
  {
    id: "3",
    title: "UX/UI Designer",
    company: "Future Skills Academy",
    location: "Remote",
    type: "Contract",
    tags: ["Figma", "Design System", "Prototyping"],
    description:
      "Translate complex user needs and business goals into intuitive, beautiful, and accessible user interfaces and experiences.",
    responsibilities: [
      "Conduct user research and usability testing",
      "Design user flows, wireframes, and prototypes",
      "Maintain and expand the company's design system in Figma",
    ],
    requirements: [
      "3+ years professional UX/UI experience",
      "Mastery of Figma or similar tools",
      "Strong portfolio demonstrating process and final work",
    ],
  },
];

const ADMIN_FLAG = "jobfair-admin";

/** ----------------- Helpers ----------------- */
function normalizeJob(j: Partial<Job>): Job {
  const splitList = (s?: string | string[]) =>
    Arrayasy(s)
      ? s
      : typeof s === "string" && s
      ? s.split(/[;\n]/).map((x) => x.trim()).filter(Boolean)
      : [];
  const splitTags = (s?: string | string[]) =>
    Arrayasy(s)
      ? s
      : typeof s === "string" && s
      ? s.split(",").map((x) => x.trim()).filter(Boolean)
      : [];

  return {
    id:
      j.id ||
      (typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2)),
    title: (j.title || "Untitled role").trim(),
    company: (j.company || "").trim(),
    location: (j.location || "").trim(),
    type: (j.type || "Full-time").trim(),
    tags: splitTags(j.tags || []),
    description: j.description || "",
    responsibilities: splitList(j.responsibilities || []),
    requirements: splitList(j.requirements || []),
  };
}

function useSearch(jobs: Job[], query: string, type: string) {
  return useMemo(() => {
    let list = jobs || [];
    if (type && type !== "All") list = list.filter((j) => j.type === type);
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((j) =>
      [j.title, j.company, j.location, (j.tags || []).join(" ")].join(" ").toLowerCase().includes(q)
    );
  }, [jobs, query, type]);
}

function isAdmin(): boolean {
  try {
    return localStorage.getItem(ADMIN_FLAG) === "1";
  } catch {
    return false;
  }
}

function setAdmin(v: boolean) {
  try {
    if (v) localStorage.setItem(ADMIN_FLAG, "1");
    else localStorage.removeItem(ADMIN_FLAG);
  } catch {}
}

/** --------------- Main App ------------------ */
export default function App() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("jobfair-jobs") || "null");
      // Ensure cached data is normalized to handle potential type issues on load
      return Arrayasy(cached) ? cached.map(normalizeJob) : INITIAL_JOBS; 
    } catch {
      return INITIAL_JOBS;
    }
  });
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [selected, setSelected] = useState<Job | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [admin, setAdminState] = useState(isAdmin());
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("jobfair-jobs", JSON.stringify(jobs));
    } catch {}
  }, [jobs]);

  const results = useSearch(jobs, query, type);

  function deleteJob(id: string) {
    if (!admin) return;
    if (!window.confirm("Delete this vacancy? This action cannot be undone.")) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <a href="https://www.iq.zain.com" target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg hover:bg-gray-50 transition">
              {/* Note: Ensure zain-logo.png is available in the public folder */}
              <img src={ZAIN_LOGO_URL} className="h-9 w-auto" alt="Zain Iraq" />
            </a>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-purple-800">
              Woman In Tech 2025 - Job Fair
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!admin ? (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150"
                title="Organizer sign in"
              >
                Organizer Sign In
              </button>
            ) : (
              <>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Admin Access
                </span>
                <button
                  onClick={() => {
                    setAdmin(false);
                    setAdminState(false);
                  }}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Search / Filter */}
        <section className="mb-6">
          <div className="grid gap-4 md:grid-cols-4">
            <input
              className="md:col-span-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none shadow-inner focus:border-fuchsia-500 transition"
              placeholder="Search by title, company, location, or tag…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="relative">
                <select
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none shadow-inner focus:border-fuchsia-500 appearance-none pr-10 transition"
                value={type}
                onChange={(e) => setType(e.target.value)}
                >
                {["All", ...Array.from(new Set((jobs || []).map((j) => j.type)))].map((t) => (
                    <option key={t}>{t}</option>
                ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
          </div>
        </section>

        {/* Admin controls */}
        <section className="mb-8">
          {!admin ? (
            <div className="rounded-xl border border-dashed border-purple-300 bg-purple-50 p-4 text-sm text-purple-700">
              Organizers: <button className="underline font-semibold hover:text-purple-900" onClick={() => setShowAdminLogin(true)}>sign in</button> to manage vacancies.
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl shadow-inner border border-gray-100">
              <div className="text-sm text-gray-600">
                Admin view active. Use the buttons below to manage content.
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-purple-700 transition"
              >
                + Post New Vacancy
              </button>
            </div>
          )}
        </section>

        {/* Jobs grid */}
        <section>
          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500 bg-white">
              <p className="text-xl font-medium">No vacancies found.</p>
              <p className="text-sm mt-2">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelected(job)}
                  className="group text-left rounded-2xl border border-gray-100 bg-white p-6 shadow-xl transition transform hover:scale-[1.01] hover:shadow-2xl hover:border-fuchsia-400"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-purple-800 group-hover:text-fuchsia-600 transition">{job.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {job.company}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-gray-500 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        {job.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-800 whitespace-nowrap">
                        {job.type}
                      </span>
                      {admin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJob(job.id);
                          }}
                          className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-200 transition"
                          title="Delete vacancy"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm text-gray-700">{job.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(job.tags || []).slice(0, 4).map((t) => (
                      <span key={t} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                  {submitted[job.id] && (
                    <div className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-xs font-medium text-green-700 border border-green-200">
                      Application submitted successfully!
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {selected && (
        <JobModal
          job={selected}
          onClose={() => setSelected(null)}
          onSubmitted={(id) => setSubmitted((s) => ({ ...s, [id]: true }))}
        />
      )}
      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onSuccess={() => {
            setAdmin(true);
            setAdminState(true);
            setShowAdminLogin(false);
          }}
        />
      )}
      {admin && showAdd && (
        <AddVacancyModal
          onClose={() => setShowAdd(false)}
          onSave={(j) => {
            setJobs((prev) => [normalizeJob(j), ...prev]);
            setShowAdd(false);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-gray-500 flex flex-col md:flex-row items-center gap-3">
          <img src={ZAIN_LOGO_URL} alt="Zain Iraq" className="h-5 w-auto opacity-80" />
          <span className="text-center md:text-left">© {new Date().getFullYear()} CER. Proudly supporting the Iraqi Tech Ecosystem.</span>
        </div>
      </footer>
    </div>
  );
}

/** --------------- Admin Login Modal ------------------ */
function AdminLoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const PASS = (window as any)?.ADMIN_PASSCODE || "ZAIN-ADMIN"; // overrideable in console
    if (code.trim() === PASS) {
      setError("");
      onSuccess();
    } else {
      setError("Invalid passcode. Contact organizer.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-purple-700">Organizer Sign In</h2>
        <p className="mt-2 text-sm text-gray-600">Enter the admin passcode to manage vacancies.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter passcode"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition"
          />
          {error && <div className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700 border border-red-200">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-purple-700 transition">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** --------------- Add Vacancy Modal ------------------ */
function AddVacancyModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  // accept raw string fields; parent will call normalizeJob(...)
  onSave: (j: any) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    tags: "",
    description: "",
    responsibilities: "",
    requirements: "",
  });
  const [error, setError] = useState("");

  const set = (k: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    setError("");
    onSave({ ...form });
  }

  const formId = "add-vacancy-form";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-3xl bg-white shadow-2xl h-[95svh] md:h-auto max-h-[95svh] md:max-h-[85svh] overflow-hidden flex flex-col rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-6 border-b bg-white/95 backdrop-blur px-6 py-5">
          <h2 className="text-2xl font-bold text-purple-700">Post New Vacancy</h2>
          <button onClick={onClose} className="rounded-xl bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200">
            Close
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-28">
          <form id={formId} onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Title*</label>
              <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-inner focus:border-fuchsia-500 transition" value={form.title} onChange={set("title")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Company</label>
              <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-inner focus:border-fuchsia-500 transition" value={form.company} onChange={set("company")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Location</label>
              <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-inner focus:border-fuchsia-500 transition" value={form.location} onChange={set("location")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Type</label>
              <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-inner focus:border-fuchsia-500 transition" value={form.type} onChange={set("type")}>
                {["Full-time", "Part-time", "Contract", "Internship", "Temporary"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold">Tags (comma separated, max 5)</label>
              <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-inner focus:border-fuchsia-500 transition" value={form.tags} onChange={set("tags")} placeholder="e.g., React, SQL, Cloud" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold">Description</label>
              <textarea rows={3} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-inner focus:border-fuchsia-500 transition" value={form.description} onChange={set("description")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Responsibilities (semicolon or new line)</label>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-inner focus:border-fuchsia-500 transition"
                value={form.responsibilities}
                onChange={set("responsibilities")}
                placeholder={"Develop pipelines;\nEnsure data integrity;\nPerform code reviews"}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Requirements (semicolon or new line)</label>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 shadow-inner focus:border-fuchsia-500 transition"
                value={form.requirements}
                onChange={set("requirements")}
                placeholder={"3+ years experience;\nMastery of SQL;\nFamiliarity with AWS"}
              />
            </div>
            {error && (
              <div className="md:col-span-2 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>
            )}
          </form>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 z-10 border-t bg-white/95 backdrop-blur px-6 py-4 shadow-top">
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button form={formId} type="submit" className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-purple-700 transition">
              Save Vacancy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** --------------- Job Modal (Apply) ------------------ */
function JobModal({
  job,
  onClose,
  onSubmitted,
}: {
  job: Job;
  onClose: () => void;
  onSubmitted: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (!file) return "Please attach your CV.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      setOk(false);
      return;
    }
    setError("");
    setLoading(true);

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
      // NOTE: This calls the single API route api/apply-job.js
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
      // Clear form state after successful submission
      setName("");
      setEmail("");
      setPhone("");
      setFile(null);

    } catch (err: any) {
      setOk(false);
      setError(err?.message || "Submission failed due to server error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl md:rounded-3xl h-[95vh] md:h-auto max-h-[95vh] md:max-h-[85vh] overflow-y-auto overscroll-contain">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-6 sticky top-0 bg-white/95 backdrop-blur -mx-6 px-6 pt-2 pb-3 border-b mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-purple-800">{job.title}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {job.company} • {job.location} • {job.type}
            </p>
          </div>
          <button className="rounded-xl bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: description */}
          <div className="md:border-r md:pr-6 border-gray-100">
            <p className="text-gray-800 leading-relaxed">{job.description}</p>
            
            {job.responsibilities.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-purple-700 border-b pb-1 border-purple-100">Responsibilities</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {job.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {job.requirements.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-fuchsia-700 border-b pb-1 border-fuchsia-100">Requirements</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {job.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
                {(job.tags || []).map((t) => (
                    <span key={t} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                      #{t}
                    </span>
                ))}
            </div>
          </div>

          {/* Right: apply form */}
          <form onSubmit={handleSubmit} className="p-1 space-y-4">
            <h3 className="text-lg font-bold text-fuchsia-800">Submit Your Application</h3>
            <p className="text-sm text-gray-600">
              Your CV will be stored securely in Firebase Storage.
            </p>

            <div>
                <label className="mb-1 block text-sm font-semibold">Full name*</label>
                <input
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                disabled={loading}
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-semibold">Email*</label>
                <input
                type="email"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={loading}
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-semibold">Phone</label>
                <input
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+964 … (Optional)"
                disabled={loading}
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-semibold">CV (PDF / DOCX)*</label>
                <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="w-full rounded-xl border border-gray-300 p-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-fuchsia-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-fuchsia-700 disabled:file:opacity-50 shadow-sm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
                />
            </div>

            {error && <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>}
            {ok && <div className="rounded-xl bg-green-100 px-4 py-3 text-sm text-green-700 border border-green-200">Application submitted successfully!</div>}

            <button
              type="submit"
              className={`w-full rounded-xl px-4 py-3 text-base font-bold text-white shadow-xl transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700"
              }`}
              disabled={loading || ok}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>

            <p className="mt-3 text-xs text-gray-500 text-center">
              By submitting, you consent to processing your information for this job opportunity.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
```eof
