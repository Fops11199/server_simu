import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ServiceRail } from './ServiceRail';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 h-[60px] md:h-[72px] transition-all duration-200 ${
        scrolled 
          ? 'bg-[var(--ink)]/92 backdrop-blur-md border-b border-[var(--steel-line)]' 
          : 'bg-[var(--ink)] border-b border-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto h-full px-6 md:px-10 lg:px-20 flex items-center justify-between">
        {/* Left: Wordmark & Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-display font-medium tracking-tight text-white hover:opacity-90 transition-opacity">
            PapperLab
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#product" className="text-[var(--text-dark-bg)] hover:text-white transition-colors text-sm">Product</a>
            <a href="#modules" className="text-[var(--text-dark-bg)] hover:text-white transition-colors text-sm">Modules</a>
            <a href="#pricing" className="text-[var(--text-dark-bg)] hover:text-white transition-colors text-sm">Pricing</a>
            <a href="#docs" className="text-[var(--text-dark-bg)] hover:text-white transition-colors text-sm">Docs</a>
          </nav>
        </div>

        {/* Right: Rail & Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:block">
            <ServiceRail scale="compact" />
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm text-[var(--text-dark-bg)] hover:text-white transition-colors">
              Log in
            </Link>
            <Link to="/app" className="btn-primary py-2 px-5 text-sm whitespace-nowrap">
              Start a free lab
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
