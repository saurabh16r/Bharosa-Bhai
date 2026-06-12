import * as React from "react";
import Link from "next/link";
import { Globe, Mail, Phone } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.08)] pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 overflow-hidden flex items-center justify-center shrink-0">
                <Image 
                  src="/images/logo.png" 
                  alt="Bharosa Bhai Logo" 
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-black text-xl text-white tracking-wide">
                Bharosa <span className="text-[#F7B500]">Bhai</span>
              </span>
            </Link>
            <p className="text-[#B5B5B5] text-sm leading-relaxed max-w-xs">
              Tumhara Personal Financial Dost. Helping Indians make smart, safe, and effective financial decisions without the complex jargon.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-[#B5B5B5] hover:text-[#F7B500] transition-colors"><Globe size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-[#B5B5B5] hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link href="/test" className="text-[#B5B5B5] hover:text-white transition-colors text-sm">Free Financial Test</Link></li>
              <li><Link href="/calculator" className="text-[#B5B5B5] hover:text-white transition-colors text-sm">SIP Calculator</Link></li>
              <li><Link href="/#roadmap" className="text-[#B5B5B5] hover:text-white transition-colors text-sm">Financial Roadmap</Link></li>
              <li><Link href="/about" className="text-[#B5B5B5] hover:text-white transition-colors text-sm">About Bharosa Bhai</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-[#B5B5B5] hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[#B5B5B5] hover:text-white transition-colors text-sm">Terms & Conditions</Link></li>
              <li><Link href="/disclaimer" className="text-[#B5B5B5] hover:text-white transition-colors text-sm">Disclaimer</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-[#B5B5B5]">
                <Phone size={18} className="text-[#F7B500] shrink-0 mt-0.5" />
                <a href="tel:+919009090791" className="hover:text-white transition-colors">
                  +91 90090 90791
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#B5B5B5]">
                <Mail size={18} className="text-[#F7B500] shrink-0 mt-0.5" />
                <a href="mailto:bharosabhaii@gmail.com" className="hover:text-white transition-colors">
                  bharosabhaii@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.08)] pt-8 mt-8 text-center md:flex md:justify-between md:text-left">
          <p className="text-[#B5B5B5] text-sm">
            © {new Date().getFullYear()} Bharosa Bhai. All rights reserved.
          </p>
          <p className="text-[#B5B5B5] text-sm mt-2 md:mt-0">
            Made with trust in India ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
