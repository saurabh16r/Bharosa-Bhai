"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll logic
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const headerOffset = 80; // height of sticky navbar
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    const startPosition = window.pageYOffset;
    const distance = offsetPosition - startPosition;
    let startTime: number | null = null;
    const duration = 700; // 600-800ms

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    requestAnimationFrame(animation);
  };

  // Scroll spy IntersectionObserver for active state
  React.useEffect(() => {
    if (typeof window === "undefined" || pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px", // triggers in mid viewport
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        } else if (activeSection === entry.target.id) {
          setActiveSection(null);
        }
      });
    }, observerOptions);

    const aboutSec = document.getElementById("about");
    const roadmapSec = document.getElementById("roadmap");

    if (aboutSec) observer.observe(aboutSec);
    if (roadmapSec) observer.observe(roadmapSec);

    return () => {
      if (aboutSec) observer.unobserve(aboutSec);
      if (roadmapSec) observer.unobserve(roadmapSec);
    };
  }, [pathname, activeSection]);

  // Handle hash on initial mount or path change
  React.useEffect(() => {
    if (typeof window === "undefined" || pathname !== "/") return;

    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (hash === "about" || hash === "roadmap") {
        setTimeout(() => {
          smoothScrollTo(hash);
        }, 300);
      }
    }
  }, [pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const targetId = href.split("#")[1];
      smoothScrollTo(targetId);
      window.history.pushState(null, "", href);
    }
  };

  const links = [
    { name: "Home", href: "/" },
    { name: "Free Test", href: "/test" },
    { name: "SIP Calculator", href: "/calculator" },
    { name: "Financial Roadmap", href: "/#roadmap" },
    { name: "About", href: "/#about" },
  ];

  const isLinkActive = (link: { name: string; href: string }) => {
    if (pathname === "/") {
      if (link.name === "About" && activeSection === "about") return true;
      if (link.name === "Financial Roadmap" && activeSection === "roadmap") return true;
      if (link.name === "Home" && activeSection === null) return true;
      return false;
    }
    return pathname === link.href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 z-50">
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-[#F7B500] font-bold" : "text-[#B5B5B5] hover:text-[#F7B500]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
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
            {links.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xl font-medium transition-colors ${
                    active ? "text-[#F7B500] font-bold" : "text-white hover:text-[#F7B500]"
                  }`}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleLinkClick(e, link.href);
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
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
