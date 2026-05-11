type UserLike = {
  fullnames?: string;
  displayName?: string;
  username?: string;
  verified?: boolean;
  isVerified?: boolean;
};

export function getUserDisplayName(user?: UserLike | null): string {
  return user?.displayName || user?.fullnames || user?.username || 'Unknown';
}

export function getUserInitial(user?: UserLike | null): string {
  return getUserDisplayName(user).charAt(0).toUpperCase() || 'U';
}

export function isUserVerified(user?: UserLike | null): boolean {
  return Boolean(user?.verified ?? user?.isVerified);
}
