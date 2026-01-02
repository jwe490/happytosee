import { motion } from "framer-motion";

export const ChecklistIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="10" width="50" height="60" rx="4" stroke="#007BFF" strokeWidth="2.5" />
    <path d="M25 25 L30 30 L40 20" stroke="#007BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="25" y1="40" x2="55" y2="40" stroke="#E9ECEF" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="25" y1="50" x2="55" y2="50" stroke="#E9ECEF" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="25" y1="60" x2="45" y2="60" stroke="#E9ECEF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const SparkleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="18" stroke="#007BFF" strokeWidth="2.5" />
    <path d="M40 15 L40 25 M40 55 L40 65 M15 40 L25 40 M55 40 L65 40" stroke="#007BFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 24 L30 30 M50 30 L56 24 M50 50 L56 56 M24 56 L30 50" stroke="#E9ECEF" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="40" cy="40" r="6" fill="#007BFF" />
  </svg>
);

export const StackedCardsIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="30" width="40" height="50" rx="4" stroke="#E9ECEF" strokeWidth="2.5" />
    <rect x="20" y="20" width="40" height="50" rx="4" stroke="#E9ECEF" strokeWidth="2.5" />
    <rect x="30" y="10" width="40" height="50" rx="4" stroke="#007BFF" strokeWidth="2.5" fill="white" />
    <circle cx="50" cy="30" r="6" stroke="#007BFF" strokeWidth="2" />
    <line x1="38" y1="42" x2="62" y2="42" stroke="#007BFF" strokeWidth="2" strokeLinecap="round" />
    <line x1="38" y1="50" x2="58" y2="50" stroke="#E9ECEF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ShareArrowIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="20" r="8" stroke="#007BFF" strokeWidth="2.5" />
    <circle cx="20" cy="55" r="8" stroke="#007BFF" strokeWidth="2.5" />
    <circle cx="60" cy="55" r="8" stroke="#007BFF" strokeWidth="2.5" />
    <path d="M35 25 L25 50 M45 25 L55 50" stroke="#007BFF" strokeWidth="2.5" />
    <path d="M40 28 L40 15 M35 20 L40 15 L45 20" stroke="#007BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PhoneMockupIllustration = ({ className = "" }: { className?: string }) => (
  <motion.svg
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className={className}
    viewBox="0 0 400 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="80" y="20" width="240" height="460" rx="24" stroke="#007BFF" strokeWidth="3" fill="white" />
    <rect x="140" y="35" width="120" height="8" rx="4" fill="#E9ECEF" />

    <motion.g
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <rect x="100" y="80" width="200" height="100" rx="12" stroke="#007BFF" strokeWidth="2" fill="white" />
      <path d="M140 110 L150 110 L155 100 L160 120 L165 110 L175 110" stroke="#007BFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="120" y1="150" x2="280" y2="150" stroke="#E9ECEF" strokeWidth="2" />
      <line x1="120" y1="160" x2="240" y2="160" stroke="#E9ECEF" strokeWidth="2" />
    </motion.g>

    <motion.g
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <rect x="100" y="200" width="200" height="100" rx="12" stroke="#007BFF" strokeWidth="2" fill="white" />
      <circle cx="150" cy="240" r="15" stroke="#007BFF" strokeWidth="2" />
      <path d="M142 240 L148 246 L158 234" stroke="#007BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="175" y1="235" x2="280" y2="235" stroke="#E9ECEF" strokeWidth="2" />
      <line x1="175" y1="245" x2="250" y2="245" stroke="#E9ECEF" strokeWidth="2" />
      <rect x="120" y="265" width="160" height="20" rx="10" fill="#E9ECEF" />
    </motion.g>

    <motion.g
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <rect x="100" y="320" width="200" height="100" rx="12" stroke="#E9ECEF" strokeWidth="2" fill="white" />
      <path d="M140 360 L148 356 L156 364 L164 352 L172 360 L180 356" stroke="#E9ECEF" strokeWidth="2" strokeLinecap="round" />
    </motion.g>

    <motion.path
      d="M145 450 L165 445 L155 460 Z"
      fill="#007BFF"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, type: "spring" }}
    />
    <motion.path
      d="M200 440 L210 445 L205 420 L215 425 L210 455 L205 450 Z"
      fill="#007BFF"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
    />
  </motion.svg>
);

export const HourglassIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5 L28 5 L28 10 L20 18 L28 26 L28 35 L12 35 L12 26 L20 18 L12 10 Z" stroke="#007BFF" strokeWidth="2" strokeLinejoin="round" />
    <path d="M14 8 L26 8" stroke="#007BFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 32 L26 32" stroke="#007BFF" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="20" cy="28" rx="6" ry="3" fill="#007BFF" opacity="0.3" />
  </svg>
);

export const SampleCard1 = ({ className = "" }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.1 }}
    className={className}
    style={{ transform: "rotate(-2deg)" }}
  >
    <div className="w-60 h-80 rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 p-8 flex flex-col items-center justify-center text-white">
      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
        <svg viewBox="0 0 40 40" fill="white" className="w-12 h-12">
          <circle cx="20" cy="20" r="15" />
          <path d="M15 20 L18 23 L25 16" stroke="#007BFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-center mb-2">The Escapist</h3>
      <p className="text-sm text-white/90 text-center">Lost in other worlds</p>
    </div>
  </motion.div>
);

export const SampleCard2 = ({ className = "" }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.2 }}
    className={className}
    style={{ transform: "rotate(0deg)" }}
  >
    <div className="w-60 h-80 rounded-2xl shadow-2xl overflow-hidden bg-white border-2 border-gray-200 p-8 flex flex-col items-center justify-center">
      <div className="text-7xl font-bold text-gray-900 mb-4">87%</div>
      <div className="text-lg font-semibold text-gray-700 text-center">Fantasy & Adventure</div>
      <div className="mt-4 text-sm text-gray-500 text-center">Your most watched genre</div>
    </div>
  </motion.div>
);

export const SampleCard3 = ({ className = "" }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.3 }}
    className={className}
    style={{ transform: "rotate(2deg)" }}
  >
    <div className="w-60 h-80 rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 p-8 flex flex-col items-center justify-center text-white">
      <svg viewBox="0 0 60 60" fill="white" className="w-16 h-16 mb-6 opacity-90">
        <path d="M10 25 Q10 15 20 15 L40 15 Q50 15 50 25 L50 35 Q50 45 40 45 L20 45 Q10 45 10 35 Z" />
        <circle cx="25" cy="35" r="3" />
        <circle cx="35" cy="35" r="3" />
      </svg>
      <p className="text-lg font-medium text-center leading-relaxed">
        "You pick movies based on vibes, not ratings"
      </p>
    </div>
  </motion.div>
);
