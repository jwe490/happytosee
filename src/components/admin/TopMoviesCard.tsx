import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Bookmark } from "lucide-react";

interface MovieData {
  movie_id: number;
  movie_title?: string;
  title?: string;
  poster_path?: string;
  recommendation_count?: number;
  watchlist_count?: number;
}

interface TopMoviesCardProps {
  title: string;
  data: MovieData[];
  type: "recommended" | "watchlisted";
  isLoading?: boolean;
}

export function TopMoviesCard({ title, data, type, isLoading }: TopMoviesCardProps) {
  const Icon = type === "recommended" ? Film : Bookmark;

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-14 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Icon className="w-12 h-12 mb-2 opacity-50" />
            <p>No data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 5).map((movie, index) => {
            const movieTitle = movie.movie_title || movie.title || "Unknown";
            const count =
              type === "recommended"
                ? movie.recommendation_count
                : movie.watchlist_count;

            return (
              <div
                key={movie.movie_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {index + 1}
                </div>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movieTitle}
                    className="w-10 h-14 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                    <Film className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{movieTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {count} {type === "recommended" ? "recommendations" : "saves"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
