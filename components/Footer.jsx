'use client';

export default function Footer() {
  return (
    <footer className="glass-card border-0 rounded-none mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted">
            © 2026 Rithamio · Keep Your Rhythm Consistent
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted hover:text-primary transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
