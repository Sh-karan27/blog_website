import React from "react";

const InkDrop = () => (
  <svg className="w-5 h-5 text-[#995F2F]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#1A0E04] text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <InkDrop />
              <span className="text-xl font-black tracking-tighter">Inkwell</span>
            </div>
            <p className="text-[#A89080] text-sm leading-relaxed max-w-xs">
              A thoughtful space for long-form writing, deep reading, and meaningful ideas worth sharing.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#A89080] mb-5">Platform</h4>
            <ul className="space-y-3">
              {["Home", "Articles", "Write", "About"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#A89080] mb-5">Company</h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Contact Us"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#A89080]">© 2024 Inkwell. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Twitter */}
            <a href="#" className="text-[#A89080] hover:text-white transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6.54c-.81.36-1.68.61-2.59.71a4.54 4.54 0 001.99-2.5 9.17 9.17 0 01-2.86 1.09 4.52 4.52 0 00-7.7 4.12A12.83 12.83 0 013.32 5.09a4.51 4.51 0 001.4 6.02 4.49 4.49 0 01-2.05-.57v.06a4.52 4.52 0 003.63 4.44c-.67.18-1.38.21-2.05.08a4.53 4.53 0 004.23 3.14 9.07 9.07 0 01-6.61 2.21A12.77 12.77 0 0019.5 8.29c0-.19 0-.38-.01-.57.86-.62 1.6-1.4 2.19-2.28z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="text-[#A89080] hover:text-white transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
