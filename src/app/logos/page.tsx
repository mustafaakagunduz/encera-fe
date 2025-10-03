'use client';

import Image from 'next/image';

export default function LogosPage() {
  return (
    <div className="min-h-screen p-8" style={{
      background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.95) 0%, rgba(30, 58, 138, 0.92) 15%, rgba(30, 58, 138, 0.88) 30%, rgba(30, 58, 138, 0.82) 45%, rgba(30, 58, 138, 0.72) 60%, rgba(30, 58, 138, 0.58) 75%, rgba(30, 58, 138, 0.35) 85%, rgba(30, 58, 138, 0.15) 92%, rgba(30, 58, 138, 0.05) 96%, rgba(30, 58, 138, 0.01) 98%, rgba(30, 58, 138, 0.002) 99%, transparent 100%)',
      backdropFilter: 'blur(12px)'
    }}>
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Small Logo - Navbar Size */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-8">
            <Image
              src="/images/logo.png"
              alt="Encera Logo"
              width={157}
              height={90}
              className="object-contain"
              style={{ filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))' }}
            />
          </div>
        </div>

        {/* Medium Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-16">
            <Image
              src="/images/logo.png"
              alt="Encera Logo"
              width={314}
              height={180}
              className="object-contain"
              style={{ filter: 'drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.6))' }}
            />
          </div>
        </div>

        {/* Large Logo - HD */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-24">
            <Image
              src="/images/logo.png"
              alt="Encera Logo"
              width={628}
              height={360}
              className="object-contain"
              style={{ filter: 'drop-shadow(3px 3px 8px rgba(0, 0, 0, 0.7))' }}
            />
          </div>
        </div>

        {/* Extra Large Logo - Ultra HD */}
        <div className="flex flex-col items-center space-y-4 pb-16">
          <div className="p-32">
            <Image
              src="/images/logo.png"
              alt="Encera Logo"
              width={942}
              height={540}
              className="object-contain"
              style={{ filter: 'drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.8))' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
