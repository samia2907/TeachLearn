import StudentNavigation from "./StudentNavigation";

export default function StudentNavigationLayout({ children }) {
  return (
    <>
      <StudentNavigation />
      {children}
    </>
  );
}
