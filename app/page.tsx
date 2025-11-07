"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuditForm } from "@/components/AuditForm";

export default function Home() {
  // Simple mock user for now - will be replaced with Entra later
  const getUserName = () => 'Batten IT User';
  const getUserEmail = () => 'user@virginia.edu';
  const getUserId = () => 'temp-user-id';

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
        <AuditForm
          userName={getUserName()}
          userEmail={getUserEmail()}
          userId={getUserId()}
        />
      </main>

      <Footer />
    </div>
  );
}
