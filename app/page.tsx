"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuditForm } from "@/components/AuditForm";
import { UserInfo } from "@/types/audit";

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're in dev mode (local development)
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      // Mock user data for local development
      const mockUser = {
        clientPrincipal: {
          identityProvider: 'aad',
          userId: 'dev-user-123',
          userDetails: 'dev.user@virginia.edu',
          userRoles: ['authenticated'],
          claims: [
            { typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname', val: 'Dev' },
            { typ: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname', val: 'User' }
          ]
        }
      };
      setUserInfo(mockUser);
      setLoading(false);
      return;
    }

    // Fetch user info from Azure Easy Auth (production only)
    fetch('/.auth/me')
      .then(res => res.json())
      .then(data => {
        setUserInfo(data);

        if (!data.clientPrincipal) {
          // Not authenticated - redirect to login
          window.location.href = '/.auth/login/aad';
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user info:', err);
        setLoading(false);
      });
  }, []);

  const getUserName = () => {
    if (!userInfo?.clientPrincipal) return 'User';

    const claims = userInfo.clientPrincipal.claims;
    if (claims) {
      const givenName = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname')?.val;
      const surname = claims.find(c => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname')?.val;

      if (givenName && surname) {
        return `${givenName} ${surname}`;
      }

      const displayName = claims.find(c => c.typ === 'http://schemas.microsoft.com/identity/claims/displayname')?.val;
      if (displayName) return displayName;
    }

    const userDetails = userInfo.clientPrincipal.userDetails;
    if (userDetails && userDetails.includes('@')) {
      const namePart = userDetails.split('@')[0];
      return namePart.split('.').map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
    }

    return userDetails || 'User';
  };

  const getUserEmail = () => {
    if (!userInfo?.clientPrincipal) return '';

    const claims = userInfo.clientPrincipal.claims;
    if (claims) {
      const email = claims.find(c =>
        c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' ||
        c.typ === 'email'
      )?.val;
      if (email) return email;
    }

    const userDetails = userInfo.clientPrincipal.userDetails;
    if (userDetails && userDetails.includes('@')) {
      return userDetails;
    }

    return '';
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

  if (!userInfo?.clientPrincipal) {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/.auth/login/aad';
    }
    return null;
  }

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
          userId={userInfo.clientPrincipal.userId}
        />
      </main>

      <Footer />
    </div>
  );
}
