import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode.react'
import api from '../api'

export default function QRForm() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [entry, setEntry] = useState(null)
  const [form, setForm] = useState({ name: '', mobile: '', carNumber: '' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await api.get(`/qr/${id}`)
        setEntry(res.data)
      } catch (err) {
        alert(err.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function submit(e) {
    e.preventDefault()
    try {
      await api.post(`/qr/${id}/register`, form)
      alert('Registered successfully')
      const res = await api.get(`/qr/${id}`)
      setEntry(res.data)
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!entry) return <div className="p-6">Not found</div>

  if (entry.used) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Owner Details</h2>
        <div className="mb-2"><span className="font-medium">Name:</span> {entry.owner?.name}</div>
        <div className="mb-2"><span className="font-medium">Mobile:</span> {entry.owner?.mobile}</div>
        <div className="mb-2"><span className="font-medium">Car number:</span> {entry.owner?.carNumber}</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Register this QR</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="w-full border rounded px-2 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <input className="w-full border rounded px-2 py-2" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Car number</label>
              <input className="w-full border rounded px-2 py-2" value={form.carNumber} onChange={(e) => setForm({ ...form, carNumber: e.target.value })} required />
            </div>
            <div>
              <button className="btn" type="submit">Submit</button>
            </div>
          </form>
        </div>
        <div className="flex items-center justify-center">
          <div className="bg-white p-2 rounded border">
            <QRCode value={`${window.location.origin}/qr/${entry.id}`} size={180} />
          </div>
        </div>
      </div>
    </div>
  )
}
