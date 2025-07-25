"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import TextFooter from "@/components/TextFooter";
import PhotoPairGame from "../components/PhotoPairGame";
import ValentinesProposal from "@/components/ValentinesProposal";
import { useFarcasterUsers } from "@/hooks/useFarcasterUsers";
import {
  defaultPairs,
  defaultRevealImages,
  defaultMessage,
} from "@/data/defaultGame";

const ANIM_DURATION = 2;

import { useMiniAppReady } from "@/hooks/useMiniAppReady";

export default function Home() {
  useMiniAppReady();
  const [showValentinesProposal, setShowValentinesProposal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Dynamic Farcaster users for social experience - only on client
  const { users, loading, error, getRandomPairs } = useFarcasterUsers({
    count: 16,
    minFollowers: 50,
    enableAutoRefresh: false, // Disable auto-refresh to prevent hydration issues
  });

  // Game images - stable on server, dynamic on client
  const [gameImages, setGameImages] = useState(defaultPairs);

  // Set client flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update game images only on client side
  useEffect(() => {
    if (isClient && !loading && users.length >= 8) {
      const farcasterPairs = getRandomPairs();
      setGameImages(farcasterPairs);
    }
  }, [isClient, users, loading, getRandomPairs]);

  const handleShowProposal = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowValentinesProposal(true);
    }, ANIM_DURATION * 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black relative">
      {/* Mobile-friendly header */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="text-white text-lg font-bold">💝 Valentine's Game</div>
        <Link
          href="/create"
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-sm font-semibold shadow-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
        >
          Create Your Own
        </Link>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex items-center justify-center px-4 pt-16 pb-4">
        {!showValentinesProposal ? (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            transition={{ duration: ANIM_DURATION }}
            className="w-full max-w-lg"
          >
            <PhotoPairGame
              images={gameImages}
              handleShowProposalAction={handleShowProposal}
            />
            <TextFooter />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: ANIM_DURATION }}
            className="w-full max-w-lg"
          >
            <ValentinesProposal
              revealImages={defaultRevealImages}
              message={defaultMessage}
            />
          </motion.div>
        )}
      </div>

      {/* Mobile-friendly bottom info */}
      <div className="fixed bottom-4 left-4 right-4 text-center">
        {isClient && error && (
          <p className="text-orange-300 text-xs">
            ⚠️ Demo mode - add Neynar API key for social features
          </p>
        )}
      </div>
    </div>
  );
}
