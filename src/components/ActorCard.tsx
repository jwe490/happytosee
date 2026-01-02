import { motion } from "framer-motion";
import { User } from "lucide-react";

interface ActorCardProps {
  id: number;
  name: string;
  profileUrl: string | null;
  knownFor: string;
  popularity: number;
  onClick: (id: number) => void;
  index?: number;
}

const ActorCard = ({ id, name, profileUrl, knownFor, onClick, index = 0 }: ActorCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.02,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(id)}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted/50 border border-border/50 group-hover:border-primary/30 transition-all duration-500">
        {profileUrl ? (
          <img
            src={profileUrl}
            alt={name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
            <User className="w-16 h-16 text-muted-foreground/20" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <motion.div
          className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/40 rounded-2xl transition-all duration-500"
          initial={false}
        />

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <p className="text-xs font-medium text-white/90 mb-1">
            {name}
          </p>
          <p className="text-xs text-white/60">
            {knownFor}
          </p>
        </div>
      </div>

      <div className="mt-3 px-1 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="font-medium text-sm text-foreground line-clamp-1">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {knownFor}
        </p>
      </div>
    </motion.div>
  );
};

export default ActorCard;
