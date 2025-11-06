"use client";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName }: HeaderProps) {
  const handleLogout = () => {
    window.location.href = '/.auth/logout';
  };

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
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-uva-orange hover:bg-uva-orange-light rounded-lg font-semibold transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
