import TeacherNavigation from "./TeacherNavigation";

export default function TeacherNavigationLayout({ children }) {
  return (
    <>
      <TeacherNavigation />
      {children}
    </>
  );
}
