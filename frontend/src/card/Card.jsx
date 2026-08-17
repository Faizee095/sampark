import React from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode.react'
import api from '../api'

export default function Card() {
  const { id } = useParams()
  const [entry, setEntry] = React.useState(null)
  const [error, setError] = React.useState('')
  React.useEffect(() => {
    api.get(`/qr/${id}`).then(({ data }) => setEntry(data)).catch(() => setError('This QR tag is unavailable.'))
  }, [id])
  if (error) return <div className="py-16 text-center text-rose-700">{error}</div>
  if (!entry) return <div className="py-16 text-center text-slate-500">Preparing print card…</div>
  const url = `${window.location.origin}/qr/${entry.id}`
  return (
    <div className="py-8 sm:py-12">
      <div className="no-print mx-auto mb-5 flex max-w-3xl justify-end"><button className="btn" onClick={() => window.print()}>Print card</button></div>
      <article className="card-print print-card mx-auto max-w-3xl overflow-hidden p-0">
        <div className="grid md:grid-cols-[1fr_230px]">
          <div className="p-8 sm:p-10">
            <p className="text-sm font-extrabold tracking-[0.2em] text-teal-700">SAMPARK</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Need to reach this vehicle owner?</h1>
            <p className="mt-4 max-w-lg leading-7 text-slate-600">Scan the QR code with your phone camera to see the registered vehicle and owner contact details for parking or emergency-related issues.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3"><Feature title="Parking issue" text="Get help quickly" /><Feature title="Emergency" text="Identify an active tag" /><Feature title="Private by design" text="No contact details printed" /></div>
            <p className="mt-8 text-xs font-medium text-slate-400">SAMPARK · Smart vehicle QR tag</p>
          </div>
          <div className="flex flex-col items-center justify-center bg-teal-700 p-8 text-center text-white"><div className="rounded-xl bg-white p-3 shadow-lg"><QRCode value={url} size={170} /></div><p className="mt-5 text-sm font-semibold">Scan to open</p><p className="mt-1 text-xs text-teal-100">Vehicle tag #{entry.id.slice(0, 8).toUpperCase()}</p></div>
        </div>
      </article>
    </div>
  )
}

function Feature({ title, text }) { return <div className="rounded-lg bg-slate-50 p-3"><strong className="block text-sm text-slate-800">{title}</strong><span className="mt-1 block text-xs text-slate-500">{text}</span></div> }
