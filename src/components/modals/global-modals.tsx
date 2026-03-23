"use client";

import { useLessonModalStore } from "@/store/use-lesson-modal-store";
import { LessonStartModal } from "@/components/modals/lesson-start-modal";

export const GlobalModals = () => {
    const { isOpen, lesson, closeModal } = useLessonModalStore();

    return (
        <LessonStartModal 
            lesson={lesson} 
            isOpen={isOpen} 
            onClose={closeModal} 
        />
    );
};
