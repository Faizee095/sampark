import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Admin from './admin/Admin'
import QRForm from './qr/QRForm'
import Card from './card/Card'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-between">
          <div className="text-2xl font-bold">SAMPARK</div>
          <nav className="space-x-4">
            <Link to="/">Home</Link>
            <Link to="/admin" className="text-indigo-600">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/qr/:id" element={<QRForm />} />
          <Route path="/card/:id" element={<Card />} />
          <Route
            path="/"
            element={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h1 className="text-4xl font-extrabold">Contact the vehicle owner instantly</h1>
                  <p className="mt-4 text-gray-600">We generate single-use QR tags that car owners register. If someone needs to contact the owner (wrong parking or emergency), they scan the QR and see the owner's contact.</p>
                  <div className="mt-6">
                    <Link to="/admin" className="btn">Open Admin</Link>
                  </div>
                </div>
                <div>
                  <div className="card-print p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">SAMPARK</div>
                        <div className="muted">Print-ready QR tags for vehicles</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
