"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

// 8 images for 16 positions (8 pairs)
const images = [
  "/game-photos/1.avif",
  "/game-photos/2.avif",
  "/game-photos/3.avif",
  "/game-photos/4.avif",
  "/game-photos/5.avif",
  "/game-photos/6.avif",
  "/game-photos/7.avif",
  "/game-photos/8.avif",
];

// Create 8 pairs of images (16 images in total)
const imagePairs = images.flatMap((image) => [image, image]);

const shuffleArray = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

type CellType = number | "deco" | null;

const heartLayout: CellType[][] = [
  [null, 0, 1, null, 2, 3, null],
  [4, 5, 6, 7, 8, 9, 10],
  [null, 11, 12, 13, 14, 15, null],
  [null, null, "deco", "deco", "deco", null, null],
  [null, null, null, "deco", null, null, null],
  [null, null, null, null, null, null, null],
];

type ValentinesProposalProps = {
  handleShowProposal: () => void;
};

export default function PhotoPairGame({
  handleShowProposal,
}: ValentinesProposalProps) {
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [incorrect, setIncorrect] = useState<number[]>([]);
  const [justMatched, setJustMatched] = useState<number[]>([]);

  useEffect(() => {
    setImages(shuffleArray([...imagePairs]));
  }, []);

  const handleClick = async (index: number) => {
    if (
      selected.length === 2 ||
      matched.includes(index) ||
      selected.includes(index)
    )
      return;

    setSelected((prev) => [...prev, index]);

    if (selected.length === 1) {
      const firstIndex = selected[0];
      if (images[firstIndex] === images[index]) {
        setJustMatched([firstIndex, index]);
        setTimeout(() => {
          setMatched((prev) => [...prev, firstIndex, index]);
          setJustMatched([]);
        }, 500);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIncorrect([firstIndex, index]);
        setTimeout(() => setIncorrect([]), 1000);
      }
      setTimeout(() => setSelected([]), 1000);
    }
  };

  useEffect(() => {
    if (matched.length === imagePairs.length) {
      handleShowProposal();
    }
  }, [matched, handleShowProposal]);

  return (
    <div className="flex justify-center items-center min-h-screen w-full px-2 sm:px-4 py-8">
      <div
        className="grid grid-cols-7 gap-2 sm:gap-3 w-full"
        style={{ maxWidth: "min(90vh, 100vw)" }}
      >
        {/* Image preload - improved with proper sizes */}
        <div className="hidden">
          {images.map((image, i) => (
            <Image
              key={i}
              src={image}
              alt={`Image ${i + 1}`}
              width={400}
              height={400}
              priority
            />
          ))}
        </div>

        {heartLayout.flat().map((cell, i) => {
          // Larger on mobile, smaller on desktop
          const cellSize = "min(max(16vw, 70px), 13vh)";

          if (cell === "deco") {
            return (
              <div
                key={i}
                className="rounded-xl sm:rounded-2xl bg-red-400 border-2 sm:border-4 border-red-500 shadow-lg sm:shadow-xl"
                style={{ width: cellSize, height: cellSize }}
              />
            );
          }

          if (cell === null) {
            return (
              <div key={i} style={{ width: cellSize, height: cellSize }} />
            );
          }

          const isSelected = selected.includes(cell);
          const isMatched = matched.includes(cell);

          return (
            <motion.div
              key={i}
              className="relative cursor-pointer"
              style={{ width: cellSize, height: cellSize }}
              whileHover={{ scale: 1.05 }}
              animate={{
                scale: isSelected ? 1.15 : 1,
                zIndex: isSelected ? 10 : 0,
              }}
              transition={{ duration: 0.3 }}
              onClick={() => handleClick(cell)}
            >
              {!isSelected && !isMatched && (
                <motion.div
                  className="absolute inset-0 bg-gray-300 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-400 shadow-lg sm:shadow-xl"
                  initial={{ rotateY: 0 }}
                  animate={{
                    rotateY: isSelected || isMatched ? 180 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ backfaceVisibility: "hidden" }}
                />
              )}

              {(isSelected || isMatched) && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ rotateY: -180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={images[cell]}
                      alt={`Image ${cell + 1}`}
                      fill
                      sizes="(max-width: 768px) 16vw, 13vh"
                      priority={true}
                      className="rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-400 shadow-lg sm:shadow-xl object-cover"
                    />
                  </div>
                </motion.div>
              )}

              {incorrect.includes(cell) && (
                <motion.div
                  className="absolute inset-0 z-20"
                  animate={{ scale: [1, 1.05, 1], opacity: [1, 0.8, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-full h-full bg-red-500 rounded-xl sm:rounded-2xl"></div>
                </motion.div>
              )}

              {justMatched.includes(cell) && (
                <motion.div
                  className="absolute inset-0 z-20"
                  animate={{ scale: [1, 1.05, 1], opacity: [1, 0.8, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-full h-full bg-green-500 rounded-xl sm:rounded-2xl"></div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
