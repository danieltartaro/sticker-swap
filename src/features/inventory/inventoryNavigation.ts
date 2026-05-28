export type NavState = {
  currentIndex: number;
  furthestIndex: number;
};

export type ArrowVisibility = {
  showLeft: boolean;
  showRight: boolean;
};

export function nextStateOnDecision(
  currentIndex: number,
  furthestIndex: number,
): NavState {
  const nextCurrent = currentIndex + 1;
  return {
    currentIndex: nextCurrent,
    furthestIndex: Math.max(furthestIndex, nextCurrent),
  };
}

export function arrowVisibility(
  currentIndex: number,
  furthestIndex: number,
): ArrowVisibility {
  return {
    showLeft: currentIndex > 0,
    showRight: currentIndex < furthestIndex,
  };
}
