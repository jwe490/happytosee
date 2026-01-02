import { motion } from "framer-motion";

interface ArchetypeIconProps {
  archetypeName: string;
  gradient: string;
}

export const ArchetypeIcon = ({ archetypeName, gradient }: ArchetypeIconProps) => {
  const icons: Record<string, JSX.Element> = {
    "The Escapist": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.path
          d="M50,20 L60,40 L80,40 L65,52 L70,72 L50,60 L30,72 L35,52 L20,40 L40,40 Z"
          fill="currentColor"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    ),
    "The Analyzer": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.rect x="30" y="30" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" rx="4" />
        <motion.circle cx="45" cy="45" r="3" fill="currentColor" />
        <motion.circle cx="55" cy="45" r="3" fill="currentColor" />
        <motion.path d="M40,60 L60,60 M35,65 L65,65 M40,70 L60,70" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "The Heart Seeker": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.path
          d="M50,35 Q35,20 20,35 Q15,50 50,75 Q85,50 80,35 Q65,20 50,35"
          fill="currentColor"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    ),
    "The Thrill Junkie": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.path
          d="M50,20 L55,45 L80,45 L60,60 L68,85 L50,70 L32,85 L40,60 L20,45 L45,45 Z"
          fill="currentColor"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    ),
    "The Social Butterfly": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.ellipse cx="35" cy="50" rx="15" ry="25" fill="currentColor" />
        <motion.ellipse cx="65" cy="50" rx="15" ry="25" fill="currentColor" />
        <motion.circle cx="50" cy="50" r="8" fill="currentColor" />
      </svg>
    ),
    "The Comfort Curator": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.circle cx="42" cy="45" r="4" fill="currentColor" />
        <motion.circle cx="58" cy="45" r="4" fill="currentColor" />
        <motion.path d="M40,58 Q50,65 60,58" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "The Genre Nomad": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.path
          d="M30,50 Q30,30 50,30 Q70,30 70,50 Q70,70 50,70 Q30,70 30,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle cx="50" cy="50" r="8" fill="currentColor" />
      </svg>
    ),
    "The Philosopher": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.circle
          cx="50"
          cy="40"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.path d="M40,60 Q50,70 60,60" fill="none" stroke="currentColor" strokeWidth="2" />
        <motion.circle cx="45" cy="38" r="3" fill="currentColor" />
        <motion.circle cx="55" cy="38" r="3" fill="currentColor" />
      </svg>
    ),
  };

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} rounded-full p-6 text-white`}>
      {icons[archetypeName] || icons["The Escapist"]}
    </div>
  );
};
