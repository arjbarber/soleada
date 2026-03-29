import { type FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Loader2, Send, Wallet, TrendingUp, Users, BadgeCheck, Plus, Minus } from "lucide-react";

export interface Business {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  category: string;
  image: string;
  supporters?: number;
  totalRaised?: number;
}

interface BusinessCardProps {
  business: Business;
}

const TIP_OPTIONS = [0.01, 0.05, 0.1];

export const BusinessCard: FC<BusinessCardProps> = ({ business }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isTipping, setIsTipping] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [showCustom, setShowCustom] = useState(false);

  const handleTip = async (amount: number) => {
    if (!publicKey) {
      setError("Please connect your wallet first.");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setIsTipping(true);
    setError(null);
    setSuccess(false);

    try {
      const destinationPubkey = new PublicKey(business.walletAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: destinationPubkey,
          lamports: Math.floor(amount * LAMPORTS_PER_SOL),
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "processed");

      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#14F195", "#9945FF", "#FFFFFF", "#00C2FF"],
      });

      setTimeout(() => setSuccess(false), 5000);
      setCustomAmount("");
      setShowCustom(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Transaction failed:", err);
      setError(err.message || "Transaction failed. Please try again.");
    } finally {
      setIsTipping(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="card-container"
    >
      {/* Animated Border Beam Effect */}
      <div className="card-beam">
        <div className="card-beam-inner" />
      </div>

      <div className="card-inner">
        {/* Header */}
        <div className="card-header">
          <div className="card-img-wrapper">
            <div className="card-img-container">
              <img
                src={business.image}
                alt={business.name}
                className="card-img"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="card-badge-verified">
              <BadgeCheck size={16} color="black" />
            </div>
          </div>
          <div className="card-meta">
            <span className="card-category">
              {business.category}
            </span>
            <div className="card-trending">
              <TrendingUp size={12} color="#14f195" />
              <span>Trending</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <h3 className="card-title">
            {business.name}
          </h3>
          <p className="card-desc">
            {business.description}
          </p>

          {/* Stats Grid */}
          <div className="card-stats">
            <div className="stat-item">
              <div className="stat-label">
                <Users size={12} />
                Supporters
              </div>
              <div className="stat-value">
                {business.supporters?.toLocaleString() || "1.2k"}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">
                <Wallet size={12} />
                Raised
              </div>
              <div className="stat-value-emerald">
                {business.totalRaised?.toLocaleString() || "420"} <span className="stat-unit">SOL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="card-actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="tip-options">
              {TIP_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleTip(amount)}
                  disabled={isTipping || !publicKey}
                  className="tip-btn"
                >
                  <div className="tip-btn-bg" />
                  <span>{amount} SOL</span>
                </button>
              ))}
              <button
                onClick={() => setShowCustom(!showCustom)}
                disabled={isTipping || !publicKey}
                className={`custom-tip-toggle ${showCustom ? 'custom-tip-toggle-active' : ''}`}
              >
                {showCustom ? <Minus size={16} /> : <Plus size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {showCustom && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="custom-input-wrapper"
                >
                  <div className="custom-input-container">
                    <input
                      type="number"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Custom amount..."
                      className="custom-input"
                    />
                    <span className="custom-input-unit">SOL</span>
                  </div>
                  <button
                    onClick={() => handleTip(parseFloat(customAmount))}
                    disabled={isTipping || !customAmount}
                    className="custom-send-btn"
                  >
                    <Send size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {isTipping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="status-msg status-msg-tipping"
              >
                <Loader2 size={16} className="animate-spin" />
                Confirming on Solana...
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="status-msg status-msg-success"
              >
                <CheckCircle2 size={16} />
                Transaction Complete!
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="status-msg-error"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!publicKey && (
            <div className="wallet-prompt">
              <div className="wallet-prompt-line" />
              Connect Wallet to Tip
              <div className="wallet-prompt-line" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
