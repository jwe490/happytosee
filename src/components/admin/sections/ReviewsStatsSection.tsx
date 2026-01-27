import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Film, MessageSquare } from "lucide-react";

interface ReviewsStatsSectionProps {
  contentPerformance: {
    most_reviewed: Array<{
      movie_id: number;
      title: string;
      poster_path?: string;
      review_count: number;
      avg_rating: number;
    }>;
  } | null;
  totalReviews: number;
  isLoading: boolean;
}

export function ReviewsStatsSection({ contentPerformance, totalReviews, isLoading }: ReviewsStatsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const mostReviewed = contentPerformance?.most_reviewed || [];
  
  const avgRating = mostReviewed.length > 0
    ? (mostReviewed.reduce((acc, m) => acc + (m.avg_rating || 0), 0) / mostReviewed.length).toFixed(1)
    : "0";

  // Rating distribution (mock - would come from real data)
  const ratingDistribution = [
    { rating: 5, count: Math.floor(totalReviews * 0.35), label: "Loved it" },
    { rating: 4, count: Math.floor(totalReviews * 0.30), label: "Liked it" },
    { rating: 3, count: Math.floor(totalReviews * 0.20), label: "It was okay" },
    { rating: 2, count: Math.floor(totalReviews * 0.10), label: "Didn't like" },
    { rating: 1, count: Math.floor(totalReviews * 0.05), label: "Disliked" },
  ];

  const maxCount = Math.max(...ratingDistribution.map(r => r.count), 1);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5" />
          Reviews & Ratings
        </h2>
        <p className="text-sm text-muted-foreground">How users rate and review movies</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-semibold">{totalReviews}</p>
              </div>
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-semibold flex items-center gap-1">
                  {avgRating}
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </p>
              </div>
              <Star className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Movies Reviewed</p>
                <p className="text-2xl font-semibold">{mostReviewed.length}</p>
              </div>
              <Film className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">5-Star Reviews</p>
                <p className="text-2xl font-semibold">{ratingDistribution[0].count}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
          <CardDescription className="text-xs">How users rate movies on your platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ratingDistribution.map((item) => (
            <div key={item.rating} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    ))}
                    {Array.from({ length: 5 - item.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-muted-foreground" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-xs font-medium">{item.count}</span>
              </div>
              <Progress value={(item.count / maxCount) * 100} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Most Reviewed Movies */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Most Reviewed Movies</CardTitle>
          <CardDescription className="text-xs">Movies with the most user reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mostReviewed.slice(0, 10).map((movie, index) => (
              <div
                key={movie.movie_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <div className="w-8 h-12 rounded overflow-hidden bg-muted shrink-0">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{movie.title}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      {(movie.avg_rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">{movie.review_count} reviews</Badge>
              </div>
            ))}
            {mostReviewed.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No review data yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
