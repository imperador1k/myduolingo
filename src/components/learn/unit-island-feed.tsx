"use client";

import { UnitCardIsland } from "@/components/shared/unit-card-island";
import { useLessonModalStore } from "@/store/use-lesson-modal-store";

type Challenge = {
    id: number;
    challengeProgress?: { completed: boolean }[];
};

type Lesson = {
    id: number;
    title: string;
    completed: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    challenges?: Challenge[];
};

type Unit = {
    id: number;
    title: string;
    description: string;
    lessons: Lesson[];
    isActive: boolean;
    isCompleted: boolean;
};

export const UnitIslandFeed = ({ processedUnits, noHearts }: { processedUnits: Unit[], noHearts: boolean }) => {
    const { openModal } = useLessonModalStore();

    return (
        <>
            <div className="relative w-full flex flex-col items-center gap-4 lg:gap-[60px] pb-10">
                {processedUnits.map((unit: Unit, unitIndex: number) => (
                    <UnitCardIsland
                        key={unit.id}
                        unitIndex={unitIndex}
                        unitTitle={unit.title}
                        title={unit.title}
                        description={unit.description}
                        lessons={unit.lessons}
                        isActive={unit.isActive}
                        isCompleted={unit.isCompleted}
                        align={unitIndex % 2 === 0 ? "left" : "right"}
                        noHearts={noHearts}
                        onLessonClick={openModal}
                    />
                ))}
            </div>
        </>
    );
};
