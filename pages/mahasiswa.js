import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardMahasiswa() {
  const [user, setUser] = useState(null);
  const [scholarId, setScholarId] = useState('');
  const [publications, setPublications] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) fetchPublications();
  }, [user]);

  const fetchPublications = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user-publications/${user.id}`);
    const data = await res.json();
    setPublications(data || []);
  };

  const handleScholarIdSubmit = async () => {
    if (!scholarId) return;
    setSyncing(true);
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sync-publications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, scholar_id: scholarId })
    });
    await fetchPublications();
    setSyncing(false);
  };

  const chartData = {
    labels: publications.map(pub => pub.year),
    datasets: [{
      label: 'Jumlah Publikasi',
      data: publications.map(pub => 1),
      backgroundColor: 'rgba(59, 130, 246, 0.7)'
    }]
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Mahasiswa</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Google Scholar ID:</label>
        <input
          type="text"
          value={scholarId}
          onChange={(e) => setScholarId(e.target.value)}
          className="mt-1 p-2 border w-full rounded"
          placeholder="Contoh: xJaxiEEAAAAJ"
        />
        <button
          onClick={handleScholarIdSubmit}
          disabled={syncing}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {syncing ? 'Sinkronisasi...' : 'Sinkronkan Data'}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Grafik Publikasi</h2>
        {publications.length > 0 ? (
          <Bar data={chartData} />
        ) : (
          <p className="text-gray-600">Belum ada data publikasi.</p>
        )}
      </div>
    </div>
  );
}
