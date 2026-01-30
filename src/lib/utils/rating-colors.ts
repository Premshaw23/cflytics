export function getRatingColor(rating: number | undefined): string {
  if (rating === undefined) return "text-gray-500";
  if (rating < 1200) return "text-gray-500"; // Newbie
  if (rating < 1400) return "text-green-500"; // Pupil
  if (rating < 1600) return "text-cyan-500"; // Specialist
  if (rating < 1900) return "text-blue-500"; // Expert
  if (rating < 2100) return "text-purple-500"; // Candidate Master
  if (rating < 2300) return "text-orange-500"; // Master
  if (rating < 2400) return "text-orange-500"; // International Master
  if (rating < 2600) return "text-red-500"; // Grandmaster
  if (rating < 3000) return "text-red-600 font-bold"; // International Grandmaster
  return "text-red-700 font-black"; // Legendary Grandmaster
}

export function getRankTitle(rating: number | undefined): string {
  if (rating === undefined) return "Unrated";
  if (rating < 1200) return "Newbie";
  if (rating < 1400) return "Pupil";
  if (rating < 1600) return "Specialist";
  if (rating < 1900) return "Expert";
  if (rating < 2100) return "Candidate Master";
  if (rating < 2300) return "Master";
  if (rating < 2400) return "International Master";
  if (rating < 2600) return "Grandmaster";
  if (rating < 3000) return "International Grandmaster";
  return "Legendary Grandmaster";
}

export function getRatingBadgeClass(rating: number | undefined): string {
  if (rating === undefined) return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  if (rating < 1200) return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  if (rating < 1400) return "bg-green-500/10 text-green-500 border-green-500/20";
  if (rating < 1600) return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
  if (rating < 1900) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (rating < 2100) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  if (rating < 2300) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (rating < 2400) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (rating < 2600) return "bg-red-500/10 text-red-500 border-red-500/20";
  return "bg-red-600/10 text-red-600 border-red-600/20";
}
