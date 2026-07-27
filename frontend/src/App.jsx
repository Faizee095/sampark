import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Admin from './admin/Admin'
import QRForm from './qr/QRForm'
import Card from './card/Card'

function Home() {
  return (
    <div className="py-8 sm:py-14">
      <section className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="mb-5 inline-flex rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">Safe, simple vehicle contact</div>
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">A smarter way to connect with a parked vehicle.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">SAMPARK QR tags help people reach a vehicle owner when it matters—without publishing the owner’s personal details on the vehicle.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/admin" className="btn">Manage QR tags</Link>
            <a href="#how-it-works" className="btn-secondary">How it works</a>
          </div>
          <div className="mt-8 flex gap-6 text-sm text-slate-600">
            <span>✓ Privacy-first</span><span>✓ Print-ready</span><span>✓ Easy to register</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-6 -z-10 rounded-full bg-teal-100 blur-3xl" />
          <div className="card-print block overflow-hidden p-0">
            <div className="bg-teal-700 p-6 text-white">
              <div className="text-sm font-semibold tracking-[0.2em] text-teal-100">SAMPARK</div>
              <div className="mt-3 text-2xl font-bold">Vehicle contact tag</div>
              <p className="mt-2 text-sm text-teal-100">Scan this code if you need to reach the vehicle owner.</p>
            </div>
            <div className="flex items-center justify-between gap-4 p-6">
              <div className="grid h-28 w-28 grid-cols-5 gap-1 rounded-lg bg-slate-950 p-2">
                {Array.from({ length: 25 }, (_, i) => <i key={i} className={`rounded-sm ${[0,1,2,5,7,9,10,11,12,14,17,19,20,22,24].includes(i) ? 'bg-white' : 'bg-slate-950'}`} />)}
              </div>
              <div className="text-right text-sm text-slate-600"><strong className="block text-slate-900">Scan. Connect. Move on.</strong><span className="mt-1 block">No personal details visible on the tag.</span></div>
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="mt-20 grid gap-5 md:grid-cols-3">
        {[['1', 'Create a tag', 'Generate a unique QR tag from the dashboard.'], ['2', 'Register the vehicle', 'The vehicle owner securely adds their details.'], ['3', 'Connect safely', 'A scan confirms the tag is active without exposing private data.']].map(([number, title, text]) => (
          <article key={number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="text-sm font-bold text-teal-700">{number}</span><h2 className="mt-3 text-lg font-bold">{title}</h2><p className="mt-2 leading-6 text-slate-600">{text}</p></article>
        ))}
      </section>
    </div>
  )
}

export default function App() {
  return <div className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Link to="/" className="text-xl font-extrabold tracking-tight text-teal-800">SAMPARK</Link><nav className="flex items-center gap-5 text-sm font-semibold"><Link to="/" className="text-slate-600 hover:text-teal-700">Home</Link><Link to="/admin" className="text-teal-700 hover:text-teal-900">Admin</Link></nav></div></header><main className="mx-auto max-w-6xl px-5"><Routes><Route path="/" element={<Home />} /><Route path="/admin" element={<Admin />} /><Route path="/qr/:id" element={<QRForm />} /><Route path="/card/:id" element={<Card />} /></Routes></main></div>
}
