import MoodTile from "./MoodTile";
import { trackMoodSelection } from "@/lib/analytics";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
}

const moods = [
  { id: "happy", emoji: "😀", label: "Happy", description: "Feeling great!" },
  { id: "sad", emoji: "😢", label: "Sad", description: "Need comfort" },
  { id: "romantic", emoji: "❤️", label: "Romantic", description: "In the mood for love" },
  { id: "excited", emoji: "⚡", label: "Excited", description: "Ready for action!" },
  { id: "nostalgic", emoji: "🥹", label: "Nostalgic", description: "Feeling sentimental" },
  { id: "relaxed", emoji: "😌", label: "Relaxed", description: "Need to unwind" },
  { id: "bored", emoji: "😴", label: "Bored", description: "Surprise me!" },
];

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  const handleMoodClick = (moodId: string) => {
    onSelectMood(moodId);
    trackMoodSelection(moodId);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-center">
      {moods.map((mood, index) => (
        <MoodTile
          key={mood.id}
          id={mood.id}
          emoji={mood.emoji}
          label={mood.label}
          description={mood.description}
          isSelected={selectedMood === mood.id}
          onClick={() => handleMoodClick(mood.id)}
          index={index}
        />
      ))}
    </div>
  );
};

export default MoodSelector;
