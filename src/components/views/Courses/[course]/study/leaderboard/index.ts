import "./leaderborad.css";
import htmlString from "./leaderboard.html?raw";
import { leaderboard_imoji_message } from "@/utils/contants";
import Router from "@/router/router";
import AbstractView from "@/router/views/view";

export default class extends AbstractView {
  readonly params = Router.useParams() as {
    course: string;
  };
  private coursesList: Map<string, Info.CourseInfo> | null = null;
  isPopupView: boolean = true;

  constructor() {
    super();
    this.setTitle(`${this.params.course} | Study | Leaderboard`);
  }

  async getStaticHTML() {
    return htmlString;
  }

  async beforeStaticHTMLRender(_template: HTMLTemplateElement): Promise<void> {
    const { course } = this.params;

    this.coursesList = new Map(
      (await Router.dummyFetch("/db/courses-list.json")) as [
        string,
        Info.CourseInfo
      ][]
    );

    // not found course error
    if (!this.coursesList.has(course)) {
      throw new Error(`Sorry, [${course}] course not found`);
    }

    this.leaderBoardPopupSetup(_template);
  }

  private async leaderBoardPopupSetup(
    _template: HTMLTemplateElement
  ): Promise<void> {
    console.log("LeaderBoard popup");

    // update the popup before append to the DOM
    const courseData = this.coursesList!.get(this.params.course)!;

    _template.content.querySelector(".course-name")!.textContent =
      courseData.title;

    const messageEle = _template.content.querySelector(".message")!;

    const { emoji, message } =
      leaderboard_imoji_message[((courseData.progress / 10) >>> 0) - 1];

    messageEle.querySelector("i")!.classList.add("fa-solid", emoji);
    messageEle.querySelector(
      ".percentage"
    )!.textContent = `${courseData.progress}%`;
    messageEle.querySelector(".body")!.textContent = " - " + message;
  }
}
