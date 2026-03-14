import useSound from 'use-sound';

export const useUISounds = () => {
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });
  const [playWhoosh] = useSound('/sounds/whoosh.mp3', { volume: 0.4 });
  const [playReward] = useSound('/sounds/reward.mp3', { volume: 0.6 });
  const [playStart] = useSound('/sounds/start.mp3', { volume: 0.6 });
  const [playPop] = useSound('/sounds/pop.mp3', { volume: 0.4 });

  return { playClick, playWhoosh, playReward, playStart, playPop };
};
