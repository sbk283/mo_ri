// 404 페이지 빝빝
import { motion } from 'framer-motion';

function NotFoundFloatingBits() {
  const items = Array.from({ length: 14 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {items.map((_, i) => {
        const seed = i + 1;
        const x = (i * 73) % 100;
        const y = (i * 41) % 100;
        const delay = (i % 7) * 0.15;
        const size = 8 + ((i * 13) % 18);
        const isRing = i % 3 === 0;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ y: -10, opacity: 0 }}
            animate={{
              y: [0, -6, 0],
              x: [0, 3, 0],
              opacity: 0.35,
              rotate: isRing ? [0, 15, 0] : 0,
            }}
            transition={{ duration: 4 + (seed % 4), repeat: Infinity, delay, ease: 'easeInOut' }}
          >
            {isRing ? (
              <div
                className="rounded-full border border-sky-400/30 dark:border-sky-300/20"
                style={{ width: size + 10, height: size + 10 }}
              />
            ) : (
              <div
                className="rounded-full bg-sky-400/40 dark:bg-sky-300/30"
                style={{ width: size, height: size }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default NotFoundFloatingBits;
