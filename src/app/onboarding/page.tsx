import { getCourses } from "@/db/queries/courses";
import { OnboardingClient } from "./_components/onboarding-client";

export default async function OnboardingPage() {
  const coursesData = await getCourses();

  // Map the DB data to the shape expected by the client component
  const courses = coursesData.map((course) => ({
    id: course.id,
    title: course.title,
    imageSrc: course.imageSrc,
    studentCount: Number(course.studentCount),
  }));

  return (
    <OnboardingClient courses={courses} />
  );
}
