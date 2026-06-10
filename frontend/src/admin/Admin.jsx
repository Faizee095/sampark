import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode.react'
import api from '../api'

export default function Admin() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [adminPass, setAdminPass] = useState(() => localStorage.getItem('adminPass') || '')
  const [preview, setPreview] = useState(null)
  const [notice, setNotice] = useState(null)
  const [isLogged, setIsLogged] = useState(() => !!localStorage.getItem('adminPass'))
  const [view, setView] = useState('qrs') // 'qrs' or 'users'

  // Users view state
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  async function generate() {
    setLoading(true)
    try {
      const auth = { 'x-admin-pass': localStorage.getItem('adminPass') || adminPass }
      const res = await api.post('/admin/generate', { count: 1 }, { headers: auth })
      const created = res.data.created || []
      // normalize created items to include used flag and url
      const normalized = created.map((c) => ({ id: c.id, url: c.url, used: false }))
      // show only newly created items and open the first card in a new tab for printing
      setList(normalized)
      setNotice(`Generated ${normalized.length} QR(s)`)
      setView('qrs')
      // do not open the registration form automatically — keep generated QRs visible for printing
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      setNotice(`Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  async function loadAll() {
    setLoading(true)
    try {
      const auth = { 'x-admin-pass': localStorage.getItem('adminPass') || adminPass }
      const res = await api.get('/admin/list', { headers: auth })
      const items = (res.data.qrs || []).map((q) => ({ id: q.id, url: `${window.location.origin}/qr/${q.id}`, used: !!q.used }))
      // clear any preview and show everything
      setPreview(null)
      setList(items)
      setNotice(`Loaded ${items.length} QR entries`)
      setView('qrs')
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      setNotice(`Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  async function previewCSV() {
    setLoading(true)
    try {
      const auth = { 'x-admin-pass': localStorage.getItem('adminPass') || adminPass }
      const res = await api.get('/admin/list', { headers: auth })
      const qrs = res.data.qrs || []
      setPreview(qrs)
      setNotice(`Preview ${qrs.length} rows`)
      setView('preview')
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      setNotice(`Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  async function exportCSV() {
    try {
      const auth = { 'x-admin-pass': localStorage.getItem('adminPass') || adminPass }
      const res = await api.get('/admin/export', { headers: auth, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'qrs.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  function handleLogin() {
    if (!adminPass) return alert('Enter admin password')
    localStorage.setItem('adminPass', adminPass)
    setIsLogged(true)
    previewCSV()
    loadRecentUsers()
  }

  function handleLogout() {
    localStorage.removeItem('adminPass')
    setAdminPass('')
    setIsLogged(false)
    setList([])
    setPreview(null)
  }

  async function loadRecentUsers() {
    setLoading(true)
    try {
      const res = await api.get('/admin/list', { headers: { 'x-admin-pass': localStorage.getItem('adminPass') || adminPass } })
      const qrs = res.data.qrs || []
      const used = qrs.filter((q) => q.used).sort((a, b) => new Date(b.usedAt || 0) - new Date(a.usedAt || 0))
      setUsers(used)
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLogged) loadRecentUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogged])

  return (
    <div className="p-6">
      {notice && (
        <div className="max-w-6xl mx-auto mb-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 text-indigo-700">{notice}</div>
        </div>
      )}
      {!isLogged ? (
        <div className="max-w-md mx-auto bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
          <p className="muted mb-3">Enter the admin password to access the dashboard.</p>
          <input className="w-full border rounded px-2 py-2 mb-3" type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
          <div className="flex gap-3">
            <button className="btn" onClick={handleLogin}>Login</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-6">
          <aside className="w-56 bg-white rounded shadow p-4 h-[480px]">
            <div className="mb-4">
              <div className="font-semibold">Admin</div>
              <div className="muted text-sm">Manage QR tags</div>
            </div>
            <div className="flex flex-col gap-2">
              {/** Explicit active/inactive classes so Tailwind picks them up reliably */}
              {(() => {
                const base = 'text-left px-3 py-2 rounded';
                const active = 'bg-indigo-100 font-semibold border-l-4 border-indigo-600';
                const inactive = 'hover:bg-gray-50';
                return (
                  <>
                    <button className={`${base} ${view === 'qrs' ? active : inactive}`} onClick={() => setView('qrs')}>QR Management</button>
                    <button className={`${base} ${view === 'users' ? active : inactive}`} onClick={() => setView('users')}>Recent Users</button>
                    <button className={`${base} ${view === 'preview' ? active : inactive}`} onClick={() => { setView('preview'); previewCSV(); }}>CSV Preview</button>
                  </>
                )
              })()}

              <button className="text-left px-3 py-2 rounded hover:bg-gray-50" onClick={generate}>Generate QR</button>
              <button className="text-left px-3 py-2 rounded hover:bg-gray-50" onClick={loadAll}>Load All</button>
              <button className="text-left px-3 py-2 rounded hover:bg-gray-50" onClick={exportCSV}>Export CSV</button>
              <button className="text-left px-3 py-2 rounded hover:bg-gray-50 text-red-600 mt-4" onClick={handleLogout}>Logout</button>
            </div>
          </aside>
          <section className="flex-1">
            {view === 'qrs' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">QR Tags</h2>
                {/* Preview is now its own view; removed from QR management */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {list.map((q) => (
                    <div key={q.id} className="bg-white rounded shadow p-4">
                      <div className="flex items-start gap-3">
                        <div>
                          <QRCode value={q.url} size={120} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm break-words"><a href={q.url} target="_blank" rel="noreferrer" className="text-indigo-600">{q.url}</a></div>
                          <div className="muted mt-2">Used: {q.used ? 'yes' : 'no'}</div>
                            <div className="mt-3 flex gap-3">
                              <a className="text-sm text-indigo-600" href={`${window.location.origin}/qr/${q.id}`} target="_blank" rel="noreferrer">Open QR page</a>
                              <a className="text-sm text-indigo-600" href={`${window.location.origin}/card/${q.id}`} target="_blank" rel="noreferrer">Open Card (printable)</a>
                            </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Registered Users</h2>
                  <div className="flex items-center gap-2">
                    <input className="border rounded px-2 py-1" placeholder="Search name, mobile or car" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                  </div>
                </div>

                <div className="bg-white rounded shadow">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-2">When</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Mobile</th>
                        <th className="px-3 py-2">Car</th>
                        <th className="px-3 py-2">QR ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = users.filter((u) => {
                          if (!search) return true
                          const s = search.toLowerCase()
                          return (u.owner?.name || '').toLowerCase().includes(s) || (u.owner?.mobile || '').toLowerCase().includes(s) || (u.owner?.carNumber || '').toLowerCase().includes(s) || u.id.includes(s)
                        })
                        const start = (page - 1) * perPage
                        const pageItems = filtered.slice(start, start + perPage)
                        return pageItems.map((r) => (
                          <tr key={r.id} className="border-b last:border-0">
                            <td className="px-3 py-2">{new Date(r.usedAt).toLocaleString()}</td>
                            <td className="px-3 py-2">{r.owner?.name}</td>
                            <td className="px-3 py-2">{r.owner?.mobile}</td>
                            <td className="px-3 py-2">{r.owner?.carNumber}</td>
                            <td className="px-3 py-2 break-all">{r.id}</td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="muted">Page {page}</div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                    <button className="px-3 py-1 border rounded" onClick={() => setPage((p) => p + 1)}>Next</button>
                  </div>
                </div>
              </div>
            )}
            {view === 'preview' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">CSV Preview</h2>
                <div className="mb-4 bg-white p-3 rounded shadow">
                  <div className="text-sm font-medium mb-2">Rows: {preview?.length || 0}</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-3 py-2">ID</th>
                          <th className="px-3 py-2">Used</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Mobile</th>
                          <th className="px-3 py-2">Car</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(preview || []).map((r) => (
                          <tr key={r.id} className="border-b">
                            <td className="px-3 py-2 break-all">{r.id}</td>
                            <td className="px-3 py-2">{r.used ? 'yes' : 'no'}</td>
                            <td className="px-3 py-2">{r.owner?.name || ''}</td>
                            <td className="px-3 py-2">{r.owner?.mobile || ''}</td>
                            <td className="px-3 py-2">{r.owner?.carNumber || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
