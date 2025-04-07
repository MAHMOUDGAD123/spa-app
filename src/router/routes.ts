import NotFound from "@/router/views/not-found-view";
import Home from "@/components/views/Home";
import About from "@/components/views/About";
import Courses from "@/components/views/Courses";
import Course from "@/components/views/Courses/[course]";
import study from "@/components/views/Courses/[course]/study";
import askQuestion from "@/components/views/Courses/[course]/study/askQuestion";
import leaderboard from "@/components/views/Courses/[course]/study/leaderboard";
import PDFViewer from "@/components/views/Courses/[course]/study/PDFViewer";
import exam from "@/components/views/Courses/[course]/study/exam";

const ROUTES: Router.Routes = {
  data: [
    {
      path: "/",
      view: Home,
      name: "Home",
    },
    {
      path: "/courses",
      view: Courses,
      name: "Courses",
    },
    {
      path: "/courses/[course]",
      view: Course,
      name: "Course",
    },
    {
      path: "/courses/[course]/study",
      view: study,
      name: "About",
    },
    {
      path: "/courses/[course]/study/ask",
      view: askQuestion,
      name: "Ask",
    },
    {
      path: "/courses/[course]/study/leaderboard",
      view: leaderboard,
      name: "Leaderborad",
    },
    {
      path: "/courses/[course]/study/pdf",
      view: PDFViewer,
      name: "PDF",
    },
    {
      path: "/courses/[course]/study/exam",
      view: exam,
      name: "Exam",
    },
    {
      path: "/about",
      view: About,
      name: "About",
    },
  ],
  notFound: NotFound,
};

export default ROUTES;
