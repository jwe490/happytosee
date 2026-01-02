import { motion } from "framer-motion";
import { Users, Sparkles } from "lucide-react";

interface ActorCardProps {
  id: number;
  name: string;
  profileUrl: string | null;
  knownFor: string;
  popularity: number;
  onClick: (id: number) => void;
  index?: number;
}

const ActorCard = ({ id, name, profileUrl, knownFor, popularity, onClick, index = 0 }: ActorCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(id)}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-sm group-hover:shadow-xl transition-all duration-300 ring-2 ring-transparent group-hover:ring-primary">
        {profileUrl ? (
          <img
            src={profileUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Users className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-1.5 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="text-xs text-white/80">
              {Math.round(popularity)} popularity
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {knownFor}
        </p>
      </div>
    </motion.div>
  );
};

export default ActorCard;
