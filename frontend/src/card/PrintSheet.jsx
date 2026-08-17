import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { lookupTag } from '../api'

export default function PrintSheet() {
  const [params] = useSearchParams()
  const tokens = (params.get('tokens') || '').split(',').filter(Boolean).slice(0, 50)
  const [tags, setTags] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tokens.length) { setError('No QR tags were selected for printing.'); return }
    Promise.all(tokens.map((token) => lookupTag(token))).then(setTags).catch(() => setError('One or more QR tags could not be loaded.'))
  }, [])

  if (error) return <div className="mx-auto max-w-xl py-16 text-center text-rose-700">{error}</div>
  if (tags.length !== tokens.length) return <div className="py-16 text-center text-slate-500">Preparing {tokens.length} QR tags for print…</div>
  return <div className="print-sheet mx-auto max-w-6xl py-8"><div className="no-print mb-5 flex items-center justify-between"><div><h1 className="text-2xl font-bold">Print QR tags</h1><p className="text-slate-600">{tags.length} selected tags</p></div><button className="btn" onClick={() => window.print()}>Print / Save as PDF</button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tags.map((tag) => { const url = `${window.location.origin}/qr/${tag.scan_token}`; return <article key={tag.scan_token} className="print-tag rounded-xl border-2 border-teal-700 bg-white p-5 text-center"><p className="text-xs font-extrabold tracking-[0.2em] text-teal-700">SAMPARK</p><h2 className="mt-2 text-lg font-bold">Vehicle contact tag</h2><div className="mx-auto mt-4 inline-block rounded-lg border border-slate-200 p-2"><QRCodeSVG value={url} size={150} /></div><p className="mt-4 text-sm font-semibold">Scan to register or contact owner</p><p className="mt-1 text-xs text-slate-500">Tag #{tag.scan_token.slice(0, 8).toUpperCase()}</p></article> })}</div></div>
}
