import useSound from 'use-sound';

/**
 * Centralised sound-effect hook for gamification feedback.
 *
 * Preloads five audio sprites on mount via the `use-sound` library.
 * Components call the returned play functions to trigger non-blocking
 * audio feedback without managing individual `<audio>` elements.
 *
 * @returns `{ playClick, playWhoosh, playReward, playStart, playPop }`
 */
export const useUISounds = () => {
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });
  const [playWhoosh] = useSound('/sounds/whoosh.mp3', { volume: 0.4 });
  const [playReward] = useSound('/sounds/reward.mp3', { volume: 0.6 });
  const [playStart] = useSound('/sounds/start.mp3', { volume: 0.6 });
  const [playPop] = useSound('/sounds/pop.mp3', { volume: 0.4 });

  return { playClick, playWhoosh, playReward, playStart, playPop };
};
