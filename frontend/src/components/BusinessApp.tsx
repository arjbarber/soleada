/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { WalletContextProvider } from "./WalletContextProvider";
import { type Business, BusinessCard } from "./BusinessCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search }  from "lucide-react";

const MOCK_BUSINESSES: Business[] = [
  {
    id: "1",
    name: "Solaris Coffee Roasters",
    description: "Sustainable, direct-trade coffee beans roasted with 100% solar energy in the high deserts. We're scaling our roasting capacity to reach more eco-conscious cafes.",
    walletAddress: "Gv7r8p9sTuvWxyZ1234567890abcdefghijklmnop",
    category: "Food & Beverage",
    image: "https://picsum.photos/seed/coffee/400/400",
    supporters: 842,
    totalRaised: 156.4,
  },
  {
    id: "2",
    name: "Nebula Tech Labs",
    description: "Building open-source decentralized infrastructure for the next generation of the web. Currently focusing on low-latency data indexing for Solana dApps.",
    walletAddress: "Hw8s9q0tUvwXyz2345678901bcdefghijklmnopa",
    category: "Technology",
    image: "https://picsum.photos/seed/tech/400/400",
    supporters: 2105,
    totalRaised: 892.1,
  },
  {
    id: "3",
    name: "EcoThreads Collective",
    description: "Upcycled fashion brand turning ocean plastic into high-performance athletic wear. Every purchase and tip helps us clean up more coastal areas.",
    walletAddress: "Ix9t0r1uVwxYza3456789012cdefghijklmnopab",
    category: "Fashion",
    image: "https://picsum.photos/seed/fashion/400/400",
    supporters: 563,
    totalRaised: 84.2,
  },
  {
    id: "4",
    name: "Veridian Urban Farms",
    description: "Vertical hydroponic farms bringing fresh, pesticide-free greens to urban food deserts. We're building our third farm in downtown Detroit.",
    walletAddress: "Jy0u1s2vWxyZab4567890123defghijklmnopabc",
    category: "Agriculture",
    image: "https://picsum.photos/seed/farm/400/400",
    supporters: 1240,
    totalRaised: 312.5,
  },
  {
    id: "5",
    name: "Aether Audio",
    description: "High-fidelity spatial audio software for immersive virtual reality experiences. Our SDK is now used by over 50 indie game studios.",
    walletAddress: "Kz1v2t3wXyzBcd5678901234efghijklmnopabcd",
    category: "Entertainment",
    image: "https://picsum.photos/seed/audio/400/400",
    supporters: 420,
    totalRaised: 128.9,
  },
  {
    id: "6",
    name: "Zenith Wellness",
    description: "AI-driven personalized meditation and mental health platform for high-stress environments. Helping thousands find balance in the digital age.",
    walletAddress: "La2w3u4xYzaCde6789012345fghijklmnopabcde",
    category: "Health & Wellness",
    image: "https://picsum.photos/seed/wellness/400/400",
    supporters: 3150,
    totalRaised: 542.0,
  },
];

const CATEGORIES = ["All", "Technology", "Food & Beverage", "Fashion", "Agriculture", "Entertainment", "Health & Wellness"];

export function BusinessApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredBusinesses = useMemo(() => {
    return MOCK_BUSINESSES.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           b.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || b.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <WalletContextProvider>
        {/* Advanced Background System */}
        <div className="bg-system">
          <div className="bg-glow bg-glow-1" />
          <div className="bg-glow bg-glow-2" />
          <div className="bg-glow bg-glow-3" />
          <div className="bg-noise" />
        </div>


        <main className="main-wrapper">

          {/* Search & Filter Bar */}
          <section className="search-section">
            <div className="search-container">
              <div className="search-inner">
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="filter-container no-scrollbar">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`filter-btn ${selectedCategory === cat ? 'filter-btn-active' : 'filter-btn-inactive'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Business Grid */}
          <section className="grid-section">

            <AnimatePresence mode="popLayout">
              {filteredBusinesses.length > 0 ? (
                <motion.div 
                  layout
                  className="business-grid"
                >
                  {filteredBusinesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="empty-state"
                >
                  <div className="empty-icon">
                    <Search size={48} color="rgba(255,255,255,0.2)" />
                  </div>
                  <h3 className="empty-title">No businesses found</h3>
                  <p className="empty-desc">Try adjusting your search or filters.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* CTA Section
          <section className="cta-section">
            <div className="cta-bg" />
            <div className="cta-content">
              <h2 className="cta-title">Ready to <span>Launch?</span></h2>
              <p className="cta-desc">
                Join the most active community of builders on Solana. 
                Get discovered, get supported, and build the future.
              </p>
              <div className="cta-buttons">
                <button className="btn-cta-primary">
                  Apply as Founder
                </button>
                <button className="btn-cta-secondary">
                  Join Discord
                </button>
              </div>
            </div>
          </section> */}
        </main>

        {/* <footer className="footer">
          <div className="footer-content">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="footer-logo">
                  <div className="footer-logo-icon">
                    <Rocket size={20} color="white" />
                  </div>
                  <span className="footer-logo-text">SupporterHub</span>
                </div>
                <p className="footer-desc">
                  The premier decentralized support network for the Solana ecosystem. 
                  Empowering builders since 2026.
                </p>
              </div>
              <div>
                <h4 className="footer-col-title">Platform</h4>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Explore</a></li>
                  <li><a href="#" className="footer-link">Trending</a></li>
                  <li><a href="#" className="footer-link">New Projects</a></li>
                  <li><a href="#" className="footer-link">Leaderboard</a></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-col-title">Resources</h4>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Documentation</a></li>
                  <li><a href="#" className="footer-link">API Reference</a></li>
                  <li><a href="#" className="footer-link">Brand Assets</a></li>
                  <li><a href="#" className="footer-link">Support</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-community">
                <Heart size={16} fill="#14f195" color="#14f195" />
                Built for the Solana Community
              </div>
              <div className="footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer> */}
    </WalletContextProvider>
  );
}