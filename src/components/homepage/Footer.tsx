import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[var(--ink)] border-t border-[var(--steel-line)] pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20">
        
        {/* Top 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <h4 className="font-display font-medium text-white mb-4">Product</h4>
            <ul className="flex flex-col gap-3 text-sm text-[var(--ash)]">
              <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-medium text-white mb-4">Modules</h4>
            <ul className="flex flex-col gap-3 text-sm text-[var(--ash)]">
              <li><Link to="/app" className="hover:text-white transition-colors">Hostinger sandbox</Link></li>
              <li><Link to="/app" className="hover:text-white transition-colors">Contabo sandbox</Link></li>
              <li><Link to="/app" className="hover:text-white transition-colors">AWS Console sandbox</Link></li>
              <li><Link to="/app" className="hover:text-white transition-colors">cPanel sandbox</Link></li>
              <li><Link to="/app" className="hover:text-white transition-colors">DigitalOcean sandbox</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-medium text-white mb-4">Resources</h4>
            <ul className="flex flex-col gap-3 text-sm text-[var(--ash)]">
              <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lab library</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-medium text-white mb-4">Company</h4>
            <ul className="flex flex-col gap-3 text-sm text-[var(--ash)]">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[var(--steel-line)] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--ash)]">
          <div className="flex items-center gap-6">
            <span className="font-display font-medium text-white">PapperLab</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--status-success)] shadow-[0_0_8px_var(--status-success)]"></span>
            <span className="text-[var(--text-dark-bg)]">All lab environments operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
