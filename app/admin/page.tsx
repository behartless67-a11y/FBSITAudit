"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UserInfo, AuditResponse } from "@/types/audit";
import { areas } from "@/data/questions";

interface ResponseStats {
  totalResponses: number;
  byArea: Record<string, number>;
  byMonth: Record<string, number>;
  recentResponses: AuditResponse[];
}

export default function AdminPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<AuditResponse[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('current');

  useEffect(() => {
    // Check if we're in dev mode (local development)
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      // Mock user data for local development
      const mockUser = {
        clientPrincipal: {
          identityProvider: 'aad',
          userId: 'admin-user-123',
          userDetails: 'admin.user@virginia.edu',
          userRoles: ['authenticated', 'admin'],
          claims: [
            { typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname', val: 'Admin' },
            { typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname', val: 'User' }
          ]
        }
      };
      setUserInfo(mockUser);

      // Load mock responses from localStorage for demo
      const storedResponses = localStorage.getItem('auditResponses');
      if (storedResponses) {
        setResponses(JSON.parse(storedResponses));
      }

      setLoading(false);
      return;
    }

    // Fetch user info from Azure Easy Auth (production only)
    fetch('/.auth/me')
      .then(res => res.json())
      .then(data => {
        setUserInfo(data);

        if (!data.clientPrincipal) {
          window.location.href = '/.auth/login/aad';
        } else {
          // Fetch responses
          fetchResponses();
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user info:', err);
        setLoading(false);
      });
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await fetch('/api/admin/responses');
      if (response.ok) {
        const data = await response.json();
        setResponses(data.responses || []);
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const getUserName = () => {
    if (!userInfo?.clientPrincipal) return 'Admin';

    const claims = userInfo.clientPrincipal.claims;
    if (claims) {
      const givenName = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')?.val;
      const surname = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')?.val;

      if (givenName && surname) {
        return `${givenName} ${surname}`;
      }
    }

    return userInfo.clientPrincipal.userDetails || 'Admin';
  };

  const getStats = (): ResponseStats => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    return {
      totalResponses: responses.length,
      byArea: responses.reduce((acc, r) => {
        acc[r.areaName] = (acc[r.areaName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byMonth: responses.reduce((acc, r) => {
        acc[r.month] = (acc[r.month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentResponses: responses
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 10)
    };
  };

  const getFilteredResponses = () => {
    let filtered = responses;

    if (selectedArea !== 'all') {
      filtered = filtered.filter(r => r.areaId === selectedArea);
    }

    if (selectedMonth === 'current') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      filtered = filtered.filter(r => r.month === currentMonth);
    } else if (selectedMonth !== 'all') {
      filtered = filtered.filter(r => r.month === selectedMonth);
    }

    return filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  };

  const getCompletionRate = (areaId: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const areaResponses = responses.filter(r => r.areaId === areaId && r.month === currentMonth);
    // In production, you'd compare against total assigned users
    return areaResponses.length;
  };

  const exportToCSV = () => {
    const filtered = getFilteredResponses();
    const headers = ['Date', 'User', 'Email', 'Area', 'Month', 'Responses'];
    const rows = filtered.map(r => [
      new Date(r.submittedAt).toLocaleString(),
      r.userName,
      r.userEmail,
      r.areaName,
      r.month,
      JSON.stringify(r.responses)
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-uva-orange mx-auto mb-6"></div>
          <p className="text-xl text-uva-navy">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const filteredResponses = getFilteredResponses();
  const availableMonths = Array.from(new Set(responses.map(r => r.month))).sort().reverse();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/garrett-hall-sunset.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'grayscale(100%)',
        }}
      ></div>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-white/85 -z-10"></div>

      <Header userName={getUserName()} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-uva-navy mb-2">Admin Dashboard</h1>
          <div className="w-24 h-1 bg-uva-orange mb-4"></div>
          <p className="text-gray-600">View and manage monthly audit responses</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Total Responses</div>
            <div className="text-3xl font-bold text-uva-navy">{stats.totalResponses}</div>
          </div>

          {areas.map(area => (
            <div key={area.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
              <div className="text-sm text-gray-500 mb-1">{area.name}</div>
              <div className="text-3xl font-bold text-uva-orange">{getCompletionRate(area.id)}</div>
              <div className="text-xs text-gray-500 mt-1">this month</div>
            </div>
          ))}
        </div>

        {/* Filters and Export */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="area-filter" className="block text-sm font-semibold text-uva-navy mb-2">
                Filter by Area
              </label>
              <select
                id="area-filter"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-uva-orange focus:outline-none"
              >
                <option value="all">All Areas</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="month-filter" className="block text-sm font-semibold text-uva-navy mb-2">
                Filter by Month
              </label>
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-uva-orange focus:outline-none"
              >
                <option value="current">Current Month</option>
                <option value="all">All Months</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="px-6 py-2 bg-uva-orange hover:bg-uva-orange-light text-white rounded-lg font-semibold transition-colors"
            >
              Export to CSV
            </button>
          </div>
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-uva-navy text-white">
            <h2 className="text-xl font-bold">
              Responses ({filteredResponses.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            {filteredResponses.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No responses found for the selected filters.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Area</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredResponses.map((response, index) => (
                    <tr key={response.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(response.submittedAt).toLocaleDateString()} {new Date(response.submittedAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{response.userName}</div>
                        <div className="text-xs text-gray-500">{response.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{response.areaName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{response.month}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            const area = areas.find(a => a.id === response.areaId);
                            if (!area) return;

                            const details = area.questions.map(q => {
                              const answer = response.responses[q.id];
                              return `Q${q.id}: ${q.text}\nAnswer: ${answer || 'Not answered'}`;
                            }).join('\n\n');

                            alert(`Audit Response Details\n\nUser: ${response.userName}\nArea: ${response.areaName}\nMonth: ${response.month}\n\n${details}`);
                          }}
                          className="text-uva-orange hover:text-uva-orange-light font-semibold text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Info Note for Development */}
        {process.env.NODE_ENV === 'development' && responses.length === 0 && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Development Mode</h3>
            <p className="text-blue-800 mb-4">
              No responses yet. Submit a form to see data here. In production, this dashboard will connect to your database.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-uva-orange hover:bg-uva-orange-light text-white rounded-lg font-semibold transition-colors"
            >
              Go to Form
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
