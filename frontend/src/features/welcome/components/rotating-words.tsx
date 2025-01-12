// rotating-words.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const words = ["Amazing", "Bruh", "Best-in-Class", "the Bleeding Edge"];
const intervalTime = 3000; // Time in milliseconds before switching words

export function RotatingWords() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="inline-flex text-purple-600 font-bold"
      >
        {words[index]}
      </motion.div>
    </AnimatePresence>
  );
}