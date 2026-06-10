import React from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode.react";
import api from "../api";

export default function Card() {
  const { id } = useParams();
  const [entry, setEntry] = React.useState(null);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/qr/${id}`);
        setEntry(res.data);
      } catch (err) {
        setEntry(null);
      }
    }
    load();
  }, [id]);

  if (!entry) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg print:max-w-full">
          <div className="md:flex">
            <div className="md:flex-1 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-extrabold">SAMPARK</div>
                  <div className="text-sm text-gray-500">Car tag by NGF132</div>
                </div>
                <div className="text-right muted">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Scan the code to contact the vehicle owner.
              </h2>
              <p className="mt-3 text-gray-600">
                Scan using phone camera, Google Lens or any QR scanner app.
                Provide name, mobile and car number to register this tag.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">Wrong Parking</div>
                  <div className="muted">Report issue</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">Emergency Contact</div>
                  <div className="muted">Call owner</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold">Vehicle Info</div>
                  <div className="muted">Car number shown</div>
                </div>
              </div>

              <div className="mt-6">
                <button className="btn mr-3" onClick={() => window.print()}>
                  Print Card
                </button>
                <a
                  className="btn bg-gray-700 hover:bg-gray-800"
                  href={window.location.href.replace("/card/", "/qr/")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open QR page
                </a>
              </div>
            </div>

            <div className="w-full md:w-72 bg-yellow-400 p-6 flex flex-col items-center justify-center">
              <div className="bg-white p-3 rounded-md shadow">
                <QRCode
                  value={`${window.location.origin}/qr/${entry.id}`}
                  size={200}
                />
              </div>
              <div className="mt-4 text-sm font-semibold">NGF132</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
