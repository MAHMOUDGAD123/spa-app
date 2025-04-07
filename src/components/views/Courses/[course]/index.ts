import "./course.css";
import htmlText from "./course.html?raw";
import DummyView from "@/router/views/view";
import Router from "@/router/router";

export default class extends DummyView {
  readonly params: { [k: string]: string } = Router.useParams()!;

  constructor() {
    super();
    this.setTitle(`${this.params.course}`);
  }

  async getStaticHTML() {
    return htmlText;
  }

  async beforeStaticHTMLRender(_template: HTMLTemplateElement): Promise<void> {
    const { course } = this.params as { course: string };
    const coursesList = new Map(
      (await Router.dummyFetch("/db/courses-list.json")) as [
        string,
        Info.CourseInfo
      ][]
    );

    // not found course error
    if (!coursesList.has(course)) {
      throw new Error(`Sorry, [${course}] course not found`);
    }

    // set the course title
    _template.content.querySelector(
      ".card-info>.course-title"
    )!.textContent = `${coursesList.get(course)!.title}`;
  }
}
