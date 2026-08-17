import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function QRForm() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [entry, setEntry] = useState(null)
  const [form, setForm] = useState({ name: '', mobile: '', carNumber: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/qr/${id}`).then(({ data }) => setEntry(data)).catch((err) => setStatus({ type: 'error', message: err.response?.data?.error || 'This QR tag could not be found.' })).finally(() => setLoading(false))
  }, [id])

  async function submit(event) {
    event.preventDefault(); setSubmitting(true); setStatus({ type: '', message: '' })
    try {
      await api.post(`/qr/${id}/register`, form)
      setEntry({ ...entry, used: true })
      setStatus({ type: 'success', message: 'Your vehicle has been registered successfully.' })
    } catch (err) { setStatus({ type: 'error', message: err.response?.data?.error || 'Registration could not be completed. Please try again.' }) } finally { setSubmitting(false) }
  }

  if (loading) return <div className="mx-auto max-w-xl py-20 text-center text-slate-500">Checking your QR tag…</div>
  if (!entry) return <div className="mx-auto my-16 max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-7 text-center"><h1 className="text-xl font-bold text-rose-900">QR tag unavailable</h1><p className="mt-2 text-rose-800">{status.message || 'Please check the code and try again.'}</p></div>
  if (entry.used) return <div className="mx-auto my-12 max-w-xl rounded-2xl border border-teal-100 bg-white p-8 shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-xl text-teal-800">✓</div><p className="mt-5 text-center text-sm font-bold tracking-wide text-teal-700">SAMPARK VEHICLE TAG</p><h1 className="mt-2 text-center text-2xl font-bold">This vehicle is registered</h1><p className="mt-3 text-center leading-6 text-slate-600">Need to contact the owner? Use the details below for a parking or emergency-related issue.</p><div className="mt-7 divide-y divide-slate-100 rounded-xl border border-slate-200"><Detail label="Owner" value={entry.owner?.name} /><Detail label="Vehicle number" value={entry.owner?.carNumber} /><Detail label="Mobile" value={entry.owner?.mobile} link={`tel:${entry.owner?.mobile}`} /></div><p className="mt-5 text-center text-xs leading-5 text-slate-500">Please use these details responsibly and only in relation to this vehicle.</p></div>

  return <div className="mx-auto max-w-2xl py-10 sm:py-14"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="bg-teal-700 px-6 py-7 text-white sm:px-9"><p className="text-sm font-semibold tracking-wide text-teal-100">SAMPARK VEHICLE TAG</p><h1 className="mt-2 text-2xl font-bold">Register your vehicle</h1><p className="mt-2 text-teal-100">Complete this one-time setup before placing the tag on your vehicle.</p></div><form onSubmit={submit} className="space-y-5 p-6 sm:p-9">{status.message && <div role="status" className={`rounded-lg px-4 py-3 text-sm ${status.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-teal-50 text-teal-800'}`}>{status.message}</div>}<div><label className="label" htmlFor="name">Full name</label><input id="name" className="field" placeholder="e.g. Priya Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div><div className="grid gap-5 sm:grid-cols-2"><div><label className="label" htmlFor="mobile">Mobile number</label><input id="mobile" className="field" type="tel" inputMode="numeric" placeholder="10-digit number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required /></div><div><label className="label" htmlFor="car">Vehicle number</label><input id="car" className="field uppercase" placeholder="e.g. DL 01 AB 1234" value={form.carNumber} onChange={(e) => setForm({ ...form, carNumber: e.target.value.toUpperCase() })} required /></div></div><button className="btn w-full sm:w-auto" disabled={submitting}>{submitting ? 'Registering…' : 'Register vehicle'}</button><p className="text-xs leading-5 text-slate-500">By registering, you confirm that your name, vehicle number, and mobile number will be visible to anyone who scans this QR tag.</p></form></div></div>
}

function Detail({ label, value, link }) { return <div className="flex items-center justify-between gap-4 px-4 py-4"><span className="text-sm font-semibold text-slate-500">{label}</span>{link ? <a className="font-bold text-teal-700 hover:text-teal-900" href={link}>{value}</a> : <span className="text-right font-bold text-slate-900">{value || '—'}</span>}</div> }
