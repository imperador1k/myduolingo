"use client";

import { useLessonModalStore } from "@/store/use-lesson-modal-store";
import { useHeartsModalStore } from "@/store/use-hearts-modal-store";
import { LessonStartModal } from "@/components/modals/lesson-start-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { ProModal } from "@/components/modals/pro-modal";

export const GlobalModals = () => {
    const { isOpen: isLessonOpen, lesson, closeModal: closeLessonModal } = useLessonModalStore();
    const { isOpen: isHeartsOpen, closeModal: closeHeartsModal } = useHeartsModalStore();

    return (
        <>
            <LessonStartModal 
                lesson={lesson} 
                isOpen={isLessonOpen} 
                onClose={closeLessonModal} 
            />
            <HeartsModal />
            <ProModal />
        </>
    );
};
