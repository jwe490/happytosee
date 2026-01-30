import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackMoodSelection } from "@/lib/analytics";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const [animatingMood, setAnimatingMood] = useState<string | null>(null);

  const handleMoodClick = (moodId: string) => {
    setAnimatingMood(moodId);
    setTimeout(() => {
      onSelectMood(moodId);
      trackMoodSelection(moodId);
    }, 100);
    setTimeout(() => {
      setAnimatingMood(null);
    }, 350);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-12 lg:mb-16"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <span className="text-foreground">Choose your </span>
        <span
          className="inline-block"
          style={{
            background: "linear-gradient(90deg, #E57373 0%, #FFB74D 33%, #FFF176 50%, #81C784 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          MOOD
        </span>
      </motion.h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-7 sm:gap-x-7 sm:gap-y-9 md:gap-x-9 md:gap-y-11 lg:gap-x-11 lg:gap-y-14 max-w-4xl mx-auto">
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.id;
          const isAnimating = animatingMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: index * 0.06,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              onClick={() => handleMoodClick(mood.id)}
              className="group relative flex flex-col items-center focus:outline-none touch-manipulation"
            >
              <div className="relative w-full aspect-[4/3]">
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    y: -8,
                    transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }
                  }}
                  whileTap={{ scale: 0.92 }}
                  animate={isAnimating ? {
                    scale: [1, 1.15, 1],
                    y: [0, -12, 0],
                    rotate: [0, -2, 2, 0]
                  } : {}}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`
                    relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[30px] lg:rounded-[36px]
                    cursor-pointer select-none
                    transition-all duration-300 ease-out
                    ${isSelected
                      ? "ring-[5px] ring-offset-[3px] ring-offset-background ring-[#F26B4E]/60 shadow-[0_20px_60px_-10px_rgba(242,107,78,0.6)]"
                      : "shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)] group-hover:shadow-[0_16px_48px_-8px_rgba(242,107,78,0.4)]"
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? "#E85A3D" : "#F26B4E",
                    transform: isSelected ? "translateY(-4px)" : undefined
                  }}
                >
                  <div className="absolute inset-0 overflow-visible">
                    <mood.Icon isAnimating={isAnimating} />
                  </div>

                  <div
                    className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)"
                    }}
                  />

                  <AnimatePresence>
                    {isAnimating && (
                      <>
                        <motion.div
                          initial={{ scale: 0, opacity: 0.6 }}
                          animate={{ scale: 3.5, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="absolute inset-0 m-auto w-10 h-10 rounded-full"
                          style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
                        />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 0] }}
                          transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                          className="absolute inset-0 rounded-[inherit]"
                          style={{
                            border: "3px solid rgba(255,255,255,0.6)",
                            boxShadow: "0 0 20px rgba(255,255,255,0.4)"
                          }}
                        />
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <motion.span
                animate={isAnimating ? {
                  scale: [1, 1.15, 1],
                  y: [0, -3, 0]
                } : {}}
                transition={{ duration: 0.3 }}
                className={`
                  mt-3 sm:mt-4 md:mt-5 font-bold text-sm sm:text-base md:text-lg lg:text-xl
                  transition-all duration-300
                  ${isSelected
                    ? "text-foreground scale-110"
                    : "text-foreground/85 group-hover:text-foreground group-hover:scale-105"}
                `}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  textShadow: isSelected ? "0 2px 8px rgba(242,107,78,0.3)" : undefined
                }}
              >
                {mood.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

interface IconProps {
  isAnimating: boolean;
}

const HappyIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g animate={isAnimating ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.3 }}>
      <line x1="38" y1="-8" x2="38" y2="12" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <line x1="82" y1="-8" x2="82" y2="12" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <path d="M 25 50 Q 60 85 95 50" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const SadIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g animate={isAnimating ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.3 }}>
      <line x1="38" y1="-8" x2="38" y2="12" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <line x1="82" y1="-8" x2="82" y2="12" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <path d="M 30 70 Q 60 40 90 70" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const RomanticIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g
      animate={isAnimating ? { scale: [1, 1.2, 1], y: [0, -5, 0] } : {}}
      transition={{ duration: 0.4 }}
      style={{ transformOrigin: "60px 30px" }}
    >
      <path
        d="M 60 5 C 60 -8, 40 -12, 30 2 C 15 22, 15 38, 60 68 C 105 38, 105 22, 90 2 C 80 -12, 60 -8, 60 5 Z"
        fill="none"
        stroke="black"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.g>
  </svg>
);

const BoredIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g animate={isAnimating ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.3 }}>
      <line x1="38" y1="-8" x2="38" y2="8" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <line x1="82" y1="-8" x2="82" y2="8" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <circle cx="38" cy="35" r="6" fill="black" />
    <circle cx="82" cy="35" r="6" fill="black" />
    <line x1="30" y1="65" x2="90" y2="65" stroke="black" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const RelaxedIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g animate={isAnimating ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.3 }}>
      <path d="M 25 0 Q 38 -10 50 0" fill="none" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <path d="M 70 0 Q 82 -10 95 0" fill="none" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <path d="M 25 35 Q 38 25 50 35" fill="none" stroke="black" strokeWidth="5" strokeLinecap="round" />
    <path d="M 70 35 Q 82 25 95 35" fill="none" stroke="black" strokeWidth="5" strokeLinecap="round" />
    <path d="M 30 58 Q 60 82 90 58" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const NostalgicIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g animate={isAnimating ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.3 }}>
      <line x1="38" y1="-8" x2="38" y2="8" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <line x1="82" y1="-8" x2="82" y2="8" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <circle cx="38" cy="35" r="5" fill="black" />
    <circle cx="82" cy="35" r="5" fill="black" />
    <motion.g
      animate={isAnimating ? { y: [0, 8, 0], opacity: [1, 0.4, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      <ellipse cx="100" cy="35" rx="5" ry="8" fill="black" opacity="0.7" />
      <ellipse cx="110" cy="50" rx="4" ry="6" fill="black" opacity="0.5" />
    </motion.g>
    <path d="M 35 65 Q 60 50 85 65" fill="none" stroke="black" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const MotivatedIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g
      animate={isAnimating ? { rotate: [0, -8, 8, 0], y: [0, -5, 0] } : {}}
      transition={{ duration: 0.4 }}
      style={{ transformOrigin: "60px 50px" }}
    >
      <motion.g animate={isAnimating ? { y: [0, -10, 0] } : {}} transition={{ duration: 0.3 }}>
        <line x1="45" y1="-15" x2="40" y2="-2" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <line x1="60" y1="-20" x2="60" y2="-5" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <line x1="75" y1="-15" x2="80" y2="-2" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <circle cx="45" cy="-18" r="2" fill="black" />
        <circle cx="60" cy="-23" r="2" fill="black" />
        <circle cx="75" cy="-18" r="2" fill="black" />
      </motion.g>
      <circle cx="60" cy="18" r="10" fill="none" stroke="black" strokeWidth="4" />
      <line x1="60" y1="28" x2="60" y2="55" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="35" x2="30" y2="20" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="35" x2="90" y2="20" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="55" x2="40" y2="80" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="55" x2="80" y2="80" stroke="black" strokeWidth="4" strokeLinecap="round" />
    </motion.g>
  </svg>
);

const AngryIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g animate={isAnimating ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.3 }}>
      <line x1="20" y1="15" x2="45" y2="2" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="15" x2="75" y2="2" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <circle cx="38" cy="38" r="6" fill="black" />
    <circle cx="82" cy="38" r="6" fill="black" />
    <path d="M 30 68 Q 60 52 90 68" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const AnxietyIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g animate={isAnimating ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.3 }}>
      <line x1="20" y1="2" x2="42" y2="15" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="2" x2="78" y2="15" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <circle cx="38" cy="38" r="6" fill="black" />
    <circle cx="82" cy="38" r="6" fill="black" />
    <motion.g
      animate={isAnimating ? { y: [0, 6, 0], opacity: [1, 0.5, 1] } : {}}
      transition={{ duration: 0.4 }}
    >
      <ellipse cx="102" cy="30" rx="5" ry="8" fill="black" opacity="0.6" />
      <ellipse cx="112" cy="48" rx="4" ry="6" fill="black" opacity="0.4" />
    </motion.g>
    <line x1="35" y1="65" x2="85" y2="65" stroke="black" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const TiredIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g
      animate={isAnimating ? { x: [0, 5, 0], y: [0, -8, 0], rotate: [0, 8, -5, 0] } : {}}
      transition={{ duration: 0.5 }}
      style={{ transformOrigin: "75px 30px" }}
    >
      <text x="30" y="55" fontSize="38" fontWeight="bold" fontStyle="italic" fill="black" fontFamily="Arial, sans-serif">Z</text>
      <text x="55" y="30" fontSize="30" fontWeight="bold" fontStyle="italic" fill="black" fontFamily="Arial, sans-serif">z</text>
      <text x="75" y="10" fontSize="22" fontWeight="bold" fontStyle="italic" fill="black" fontFamily="Arial, sans-serif">z</text>
    </motion.g>
  </svg>
);

const InspiredIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g
      animate={isAnimating ? { scale: [1, 1.1, 1], y: [0, -5, 0] } : {}}
      transition={{ duration: 0.4 }}
      style={{ transformOrigin: "60px 45px" }}
    >
      <motion.g
        animate={isAnimating ? { y: [0, -10, 0], scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        <ellipse cx="60" cy="-8" rx="12" ry="16" fill="none" stroke="black" strokeWidth="3" />
        <line x1="60" y1="8" x2="60" y2="20" stroke="black" strokeWidth="3" strokeLinecap="round" />
        <line x1="54" y1="17" x2="66" y2="17" stroke="black" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      <circle cx="60" cy="35" r="11" fill="none" stroke="black" strokeWidth="4" />
      <line x1="60" y1="46" x2="60" y2="68" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="52" x2="35" y2="38" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="52" x2="85" y2="38" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="68" x2="42" y2="88" stroke="black" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="68" x2="78" y2="88" stroke="black" strokeWidth="4" strokeLinecap="round" />
    </motion.g>
  </svg>
);

const ConfusedIcon = ({ isAnimating }: IconProps) => (
  <svg viewBox="0 0 120 90" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
    <motion.g animate={isAnimating ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.3 }}>
      <line x1="20" y1="2" x2="40" y2="15" stroke="black" strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="2" x2="80" y2="15" stroke="black" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <circle cx="35" cy="38" r="5" fill="black" />
    <circle cx="70" cy="38" r="5" fill="black" />
    <motion.g
      animate={isAnimating ? { rotate: [0, 15, -15, 0], y: [0, -6, 0] } : {}}
      transition={{ duration: 0.5 }}
      style={{ transformOrigin: "105px 15px" }}
    >
      <text x="88" y="10" fontSize="26" fontWeight="bold" fill="black" fontFamily="Arial, sans-serif">?</text>
      <text x="105" y="30" fontSize="18" fontWeight="bold" fill="black" opacity="0.6" fontFamily="Arial, sans-serif">?</text>
    </motion.g>
    <line x1="35" y1="65" x2="85" y2="65" stroke="black" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const moods = [
  { id: "happy", label: "Happy", Icon: HappyIcon },
  { id: "sad", label: "Sad", Icon: SadIcon },
  { id: "romantic", label: "Romantic", Icon: RomanticIcon },
  { id: "bored", label: "Bored", Icon: BoredIcon },
  { id: "relaxed", label: "Relaxed", Icon: RelaxedIcon },
  { id: "nostalgic", label: "Nostalgic", Icon: NostalgicIcon },
  { id: "motivated", label: "Motivated", Icon: MotivatedIcon },
  { id: "angry", label: "Angry", Icon: AngryIcon },
  { id: "anxiety", label: "Anxiety", Icon: AnxietyIcon },
  { id: "tired", label: "Tired", Icon: TiredIcon },
  { id: "inspired", label: "Inspired", Icon: InspiredIcon },
  { id: "confused", label: "Confused", Icon: ConfusedIcon },
];

export default MoodSelector;
