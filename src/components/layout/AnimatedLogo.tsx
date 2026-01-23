'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export const AnimatedLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="relative z-20"
        animate={{
          x: [0, 150, 0],
          rotate: [0, 720, 0],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/favicon_me.png"
          alt="Logo"
          width={24}
          height={24}
          className="rounded-full"
        />
      </motion.div>
      
      <div className="relative">
        <span className="text-lg font-medium tracking-tight whitespace-nowrap">Parishkrit Writes</span>
        <motion.div
          className="absolute top-0 left-0 h-full bg-white z-10"
          animate={{
            width: ["0%", "100%", "0%"]
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};
