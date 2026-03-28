"use client";

import Lottie from "lottie-react";
import bearDanceAnimation from "../../../../public/bear_dance.json";

export const EmptyLottie = () => {
    return <Lottie animationData={bearDanceAnimation} loop={true} />;
};
