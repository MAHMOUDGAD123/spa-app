import "./askQuestion.css";
import "./confirmPopup.css";
import askQuestionPopup from "./askQuestion.html?raw";
import confirmPopup from "./confirmPopup.html?raw";
import Router from "@/router/router";
import AbstractView from "@/router/views/view";
import { _Storage } from "@/utils/Storage";

export default class extends AbstractView {
  readonly params = Router.useParams() as {
    course: string;
  };
  private coursesList: Map<string, Info.CourseInfo> | null = null;
  isPopupView: boolean = true;

  constructor() {
    super();
    this.setTitle(`${this.params.course} | Study | Ask`);
  }

  async getStaticHTML() {
    return askQuestionPopup;
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
  }

  async afterStaticHTMLRender(): Promise<void> {
    this.askQuestionPopupSetup();
  }

  private async askQuestionPopupSetup(): Promise<void> {
    console.log("Question popup");

    // only in popup mode
    const sessionStorageLey = "_it_leg_question_";

    const { popupElement, popupSignalController, destructPopup } =
      this.popupControls!;

    const formEle = popupElement.querySelector("form")!;
    const questionIn = formEle.querySelector(
      "#questionIn"
    )! as HTMLInputElement;

    // set the previous unsubmitted input value
    const lastUnsubmittedQuestion = _Storage.read(
      sessionStorageLey,
      "sessionStorage"
    ) as string;
    if (lastUnsubmittedQuestion) {
      questionIn.value = lastUnsubmittedQuestion;
    }

    // form submit
    formEle.addEventListener(
      "submit",
      async (e) => {
        e.preventDefault();

        // delete the popup form
        destructPopup();
        Router.navigateBack();

        // show the confirm popup message
        const template = await AbstractView.createHTMLTemplate({
          htmlString: confirmPopup,
        });
        document.body.appendChild(template.content);

        setTimeout(() => {
          const popup = document.querySelector(".confirm-popup");

          if (popup) {
            popup.classList.add("hide");

            setTimeout(() => {
              popup?.remove();
            }, 2000);
          }
        }, 5000);

        // remove the session value
        _Storage.delete(sessionStorageLey, "sessionStorage");
      },
      { signal: popupSignalController.signal }
    );

    // save in session_Storage on user input
    questionIn.addEventListener(
      "input",
      () => {
        _Storage.save(sessionStorageLey, questionIn.value, "sessionStorage");
      },
      { signal: popupSignalController.signal }
    );
  }
}
