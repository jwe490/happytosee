import { motion } from "framer-motion";

interface QuestionIllustrationProps {
  questionNumber: number;
}

export const QuestionIllustration = ({ questionNumber }: QuestionIllustrationProps) => {
  const illustrations = [
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-pink-500"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path
            d="M60,90 Q70,70 80,90 M120,90 Q130,70 140,90"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-gray-800"
          />
          <motion.path
            d="M70,130 Q100,150 130,130"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-gray-800"
            animate={{ d: ["M70,130 Q100,150 130,130", "M70,135 Q100,155 130,135"] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>
      ),
      color: "from-pink-500 to-rose-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.rect
            x="50"
            y="60"
            width="100"
            height="80"
            rx="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-500"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.circle cx="80" cy="90" r="5" fill="currentColor" className="text-blue-600" />
          <motion.circle cx="120" cy="90" r="5" fill="currentColor" className="text-blue-600" />
          <motion.path
            d="M60,110 L140,110 M70,120 L130,120 M80,130 L120,130"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-400"
          />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.polygon
            points="100,40 130,90 170,90 140,120 155,170 100,140 45,170 60,120 30,90 70,90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-amber-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            cx="100"
            cy="100"
            r="15"
            fill="currentColor"
            className="text-amber-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      ),
      color: "from-amber-500 to-orange-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.path
            d="M100,50 Q50,100 100,150 Q150,100 100,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-rose-500"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle cx="100" cy="100" r="10" fill="currentColor" className="text-rose-600" />
        </svg>
      ),
      color: "from-rose-500 to-pink-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.rect
            x="60"
            y="60"
            width="80"
            height="80"
            rx="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle cx="85" cy="90" r="8" fill="currentColor" className="text-teal-600" />
          <motion.circle cx="115" cy="90" r="8" fill="currentColor" className="text-teal-600" />
          <motion.path
            d="M85,115 Q100,125 115,115"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-teal-700"
          />
        </svg>
      ),
      color: "from-teal-500 to-emerald-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.path
            d="M100,60 L120,100 L170,100 L130,130 L150,180 L100,150 L50,180 L70,130 L30,100 L80,100 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-purple-500"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      ),
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.circle
            cx="100"
            cy="80"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-orange-500"
          />
          <motion.path
            d="M70,110 L70,150 M130,110 L130,150 M70,150 L130,150"
            stroke="currentColor"
            strokeWidth="2"
            className="text-orange-600"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      ),
      color: "from-orange-500 to-red-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.path
            d="M50,150 Q50,100 100,100 T150,150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-emerald-500"
            animate={{ d: ["M50,150 Q50,100 100,100 T150,150", "M50,140 Q50,90 100,90 T150,140"] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.circle cx="70" cy="120" r="5" fill="currentColor" className="text-lime-500" />
          <motion.circle cx="100" cy="100" r="5" fill="currentColor" className="text-yellow-500" />
          <motion.circle cx="130" cy="120" r="5" fill="currentColor" className="text-emerald-500" />
        </svg>
      ),
      color: "from-emerald-500 to-lime-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.circle
            cx="100"
            cy="100"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-red-500"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path
            d="M100,75 L110,95 L130,95 L115,105 L120,125 L100,115 L80,125 L85,105 L70,95 L90,95 Z"
            fill="currentColor"
            className="text-red-600"
          />
        </svg>
      ),
      color: "from-red-500 to-rose-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.path
            d="M80,100 Q80,60 100,60 Q120,60 120,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-indigo-500"
          />
          <motion.ellipse
            cx="100"
            cy="120"
            rx="30"
            ry="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-indigo-600"
            animate={{ ry: [40, 45, 40] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </svg>
      ),
      color: "from-indigo-500 to-violet-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-cyan-500"
            animate={{ scale: [1, 1.05, 1], rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.circle cx="85" cy="90" r="6" fill="currentColor" className="text-cyan-600" />
          <motion.circle cx="115" cy="90" r="6" fill="currentColor" className="text-cyan-600" />
          <motion.path
            d="M80,115 Q100,130 120,115"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-cyan-700"
          />
        </svg>
      ),
      color: "from-cyan-500 to-blue-500",
    },
    {
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.path
            d="M100,50 L110,80 L140,85 L115,105 L125,135 L100,120 L75,135 L85,105 L60,85 L90,80 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-pink-500"
            animate={{ rotate: [0, 15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.circle
            cx="100"
            cy="95"
            r="8"
            fill="currentColor"
            className="text-pink-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      ),
      color: "from-pink-500 to-fuchsia-500",
    },
  ];

  const illustration = illustrations[(questionNumber - 1) % illustrations.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className={`w-48 h-48 mx-auto bg-gradient-to-br ${illustration.color} rounded-3xl p-8 shadow-xl`}>
        {illustration.svg}
      </div>
    </motion.div>
  );
};
