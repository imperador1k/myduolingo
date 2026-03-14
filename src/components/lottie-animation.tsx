"use client";

import Lottie from "lottie-react";
import duoAnimationData from "../../public/duo_animation.json";
import catAnimationData from "../../public/cat.json";
import broomAnimationData from "../../public/broom.json";
import drunkenOwlAnimationData from "../../public/drunken_owl.json";
import tedyAnimationData from "../../public/tedy.json";
import bearDanceAnimationData from "../../public/bear_dance.json";
import starAngryAnimationData from "../../public/star_angry.json";
import happyStarAnimationData from "../../public/happy_star.json";
import laughingCatAnimationData from "../../public/laughing_cat.json";

interface LottieAnimationProps {
    className?: string;
}

export const LottieAnimation = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={duoAnimationData} loop autoplay className={className} />
);

export const DuoAnimationLottie = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={duoAnimationData} loop autoplay className={className} />
);


export const CatLottie = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={catAnimationData} loop autoplay className={className} />
);

export const BroomLottie = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={broomAnimationData} loop autoplay className={className} />
);

export const DrunkenOwlLottie = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={drunkenOwlAnimationData} loop autoplay className={className} />
);

export const TedyLottie = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={tedyAnimationData} loop autoplay className={className} />
);

export const BearDanceLottie = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={bearDanceAnimationData} loop autoplay className={className} />
);

export const StarAngryLottie = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={starAngryAnimationData} loop autoplay className={className} />
);

export const HappyStarLottie = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={happyStarAnimationData} loop autoplay className={className} />
);

export const LaughingCatLottie = ({ className }: LottieAnimationProps) => (
    <Lottie animationData={laughingCatAnimationData} loop autoplay className={className} />
);

