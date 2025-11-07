"use client";

import Link from 'next/link';

interface HeaderProps {
  userName?: string;
  showAdminLink?: boolean;
  showFormLink?: boolean;
}

export function Header({ userName, showAdminLink = false, showFormLink = false }: HeaderProps) {
  return (
    <header className="bg-uva-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Monthly Audit Form</h1>
            <p className="text-sm text-gray-300">Frank Batten School IT Areas</p>
          </div>

          <div className="flex items-center gap-4">
            {userName && (
              <div className="text-right">
                <p className="text-sm font-semibold">{userName}</p>
              </div>
            )}
            {showFormLink && (
              <Link
                href="/"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors text-sm"
              >
                Back to Form
              </Link>
            )}
            {showAdminLink && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-uva-orange hover:bg-uva-orange-light rounded-lg font-semibold transition-colors text-sm"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
