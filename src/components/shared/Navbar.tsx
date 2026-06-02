"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", href: "/" },
    { name: "Free Test", href: "/test" },
    { name: "SIP Calculator", href: "/calculator" },
    { name: "Financial Roadmap", href: "/#roadmap" },
    { name: "Features", href: "/#features" },
    { name: "About", href: "/#about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 z-50">
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#F7B500] to-[#FF9F1A] p-[1.5px] overflow-hidden flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
            <Image 
              src="/images/crossed_arms.png" 
              alt="Bharosa Bhai" 
              width={26}
              height={26}
              className="object-contain translate-y-[2px]"
            />
          </div>
          <span className="font-heading font-black text-xl text-white tracking-wide">
            Bharosa <span className="text-[#F7B500]">Bhai</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[#B5B5B5] hover:text-[#F7B500] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/test">
            <Button variant="primary" className="glow-secondary bg-[#1E88FF]">Start Free Test</Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-0 pt-24 px-6 bg-[#0E0E0E] z-40 flex flex-col gap-6"
          >
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xl font-medium text-white hover:text-[#F7B500] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 border-t border-[rgba(255,255,255,0.08)]">
              <Link href="/test" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full h-14 text-lg">Start Free Test</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
