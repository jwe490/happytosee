export interface ActorMovieCredit {
  id: number;
  title: string;
  character?: string | null;
  job?: string | null;
  posterUrl: string;
  rating: number;
  year: number;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  profileUrl: string | null;
  knownFor: string;
  popularity: number;
  alsoKnownAs: string[];
  gender: string;
  externalIds: {
    imdb: string | null;
    instagram: string | null;
    twitter: string | null;
    facebook: string | null;
  };
  stats: {
    totalMovies: number;
    asActor: number;
    asCrew: number;
  };
  actingRoles: ActorMovieCredit[];
}
