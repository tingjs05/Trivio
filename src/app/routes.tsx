import { createBrowserRouter } from "react-router";
import Home from "./components/Home";
import StudentView from "./components/StudentView";
import ProfessorView from "./components/ProfessorView";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/student",
    Component: StudentView,
  },
  {
    path: "/professor",
    Component: ProfessorView,
  },
]);
