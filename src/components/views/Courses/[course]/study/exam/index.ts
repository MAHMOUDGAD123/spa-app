import "./exam.css";
import "./popupMessage.css";
import htmlString from "./exam.html?raw";
import popupMessage from "./popupMessage.html?raw";
import { _Storage } from "@/utils/Storage";
import Router from "@/router/router";
import AbstractView from "@/router/views/view";

type QuizName = `Q${number}`;
type ChoiceName = `C${number}`;

type QuizesStateType = {
  lastQuiz: QuizName;
  doneCount: number;
  quizes: {
    [k: QuizName]: {
      done: boolean;
      lastChoice: ChoiceName;
    };
  };
};

type QuizDatasetType = DOMStringMap & {
  quiz: QuizName;
};
type ChoiceDatasetType = DOMStringMap & {
  choice: ChoiceName;
};

export default class extends AbstractView {
  private readonly quizLocalStorageKey = "__it_leg_quiz__";
  private readonly totalQuizesCount = 5;
  readonly params = Router.useParams() as {
    course: string;
  };
  private coursesList: Map<string, Info.CourseInfo> | null = null;
  isPopupView: boolean = true;

  private initialState: QuizesStateType = {
    lastQuiz: "Q1",
    doneCount: 0,
    quizes: {
      Q1: {
        done: false,
        lastChoice: "C1",
      },
      Q2: {
        done: false,
        lastChoice: "C1",
      },
      Q3: {
        done: false,
        lastChoice: "C1",
      },
      Q4: {
        done: false,
        lastChoice: "C1",
      },
      Q5: {
        done: false,
        lastChoice: "C1",
      },
    },
  };

  private quizesState: QuizesStateType =
    (_Storage.read(
      this.quizLocalStorageKey,
      "localStorage"
    ) as QuizesStateType) ?? this.initialState;

  constructor() {
    super();
    this.setTitle(`${this.params.course} | Study | Exam`);
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
  }

  async afterStaticHTMLRender(): Promise<void> {
    this.examPopupSetup();
  }

  private updateExamState(): void {
    _Storage.save(this.quizLocalStorageKey, this.quizesState, "localStorage");
  }

  private setExamDOMState(): void {
    const { popupElement } = this.popupControls!;
    const nums = popupElement.querySelector(".exam > .nums")! as HTMLDivElement;
    const quizes = popupElement.querySelector(
      ".exam > .quizes"
    )! as HTMLDivElement;

    // show the last quiz
    (
      nums.querySelector(
        `[data-quiz="${this.quizesState.lastQuiz}"]`
      )! as HTMLInputElement
    ).click();

    // set the last user choices
    Object.entries(this.quizesState.quizes).forEach(
      ([quizName, { done, lastChoice }]) => {
        if (done) {
          const buttonEle = nums.querySelector(
            `[data-quiz="${quizName}"]`
          )! as HTMLInputElement;
          const lastChoiceInputEle = quizes.querySelector(
            `[data-quiz="${quizName}"] input[data-choice="${lastChoice}"]`
          ) as HTMLInputElement;
          buttonEle.classList.add("done");
          lastChoiceInputEle.checked = true;
        }
      }
    );
  }

  private resetExamDOMState(): void {
    const { popupElement } = this.popupControls!;
    const nums = popupElement.querySelector(".exam > .nums")! as HTMLDivElement;
    const quizes = popupElement.querySelector(
      ".exam > .quizes"
    )! as HTMLDivElement;

    // show the first quiz
    (nums.querySelector(`[data-quiz="Q1"]`)! as HTMLInputElement).click();

    // reset all choices
    Object.entries(this.quizesState.quizes).forEach(
      ([quizName, { lastChoice }]) => {
        const buttonEle = nums.querySelector(
          `[data-quiz="${quizName}"]`
        )! as HTMLInputElement;
        const lastChoiceInputEle = quizes.querySelector(
          `[data-quiz="${quizName}"] input[data-choice="${lastChoice}"]`
        ) as HTMLInputElement;
        buttonEle.classList.remove("done");
        lastChoiceInputEle.checked = false;
      }
    );
  }

  private updateDoneCount(): void {
    this.quizesState.doneCount = Object.values(this.quizesState.quizes).filter(
      ({ done }) => done
    ).length;
  }

  private async showPopupMessage(): Promise<void> {
    // show the confirm popup message
    const template = await AbstractView.createHTMLTemplate({
      htmlString: popupMessage,
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
  }

  private async examPopupSetup(): Promise<void> {
    console.log("Exam popup");

    const { popupElement, popupSignalController } = this.popupControls!;

    const checkMap = new Map<QuizName, { rightChoice: ChoiceName }>([
      ["Q1", { rightChoice: "C1" }],
      ["Q2", { rightChoice: "C3" }],
      ["Q3", { rightChoice: "C2" }],
      ["Q4", { rightChoice: "C1" }],
      ["Q5", { rightChoice: "C2" }],
    ]);

    const nums = popupElement.querySelector(".exam > .nums")! as HTMLDivElement;
    const quizes = popupElement.querySelector(
      ".exam > .quizes"
    )! as HTMLDivElement;

    nums.addEventListener(
      "click",
      (e) => {
        const target = e.target! as HTMLInputElement;

        if (target.matches("input")) {
          const { quiz } = target.dataset as QuizDatasetType;

          quizes
            .querySelector(`[data-quiz="${quiz}"]`)!
            .scrollIntoView({ behavior: "smooth" });

          // save the last quiz
          this.quizesState.lastQuiz = (target.dataset as QuizDatasetType).quiz;
          this.updateExamState();
        }
      },
      { signal: popupSignalController.signal }
    );

    quizes.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLDivElement;

        if (target.matches(".choice")) {
          const choiceInputEle = target.querySelector(
            "input"
          )! as HTMLInputElement;
          choiceInputEle.checked = true;
          // update quizes state
          const quizEle = target.closest("[data-quiz]")! as HTMLDivElement;
          const { quiz } = quizEle.dataset as QuizDatasetType;
          const { choice } = choiceInputEle.dataset as ChoiceDatasetType;
          nums.querySelector(`[data-quiz="${quiz}"]`)!.classList.add("done");
          this.quizesState.quizes[quiz] = { done: true, lastChoice: choice };
          this.updateDoneCount();
          this.updateExamState();
        }
      },
      { signal: popupSignalController.signal }
    );

    quizes.addEventListener(
      "scrollend",
      () => {
        for (const ele of quizes.children) {
          const quizEle = ele as HTMLDivElement;
          const quizRect = quizEle.getBoundingClientRect();

          const viewPortWidth = window.innerWidth >>> 1;

          if (quizRect.left < viewPortWidth && quizRect.right > viewPortWidth) {
            const { quiz } = quizEle.dataset as QuizDatasetType;

            (
              nums.querySelector(
                `input[data-quiz="${quiz}"]`
              )! as HTMLInputElement
            ).checked = true;

            // save the last quiz
            this.quizesState.lastQuiz = (
              quizEle.dataset as QuizDatasetType
            ).quiz;
            this.updateExamState();

            break;
          }
        }
      },
      { signal: popupSignalController.signal }
    );

    this.setExamDOMState();

    // submit the exam answers
    document.getElementById("submitQuiz")!.addEventListener(
      "click",
      () => {
        if (this.quizesState.doneCount < this.totalQuizesCount) {
          this.showPopupMessage();
          return;
        }

        const examSubmitResultstEle = popupElement.querySelector(
          ".quiz-submit > .results"
        )! as HTMLDivElement;

        let correntCount = 0;

        // check the answers
        checkMap.forEach(({ rightChoice }, quizName) => {
          const quizEle = quizes.querySelector(`[data-quiz="${quizName}"]`)!;
          const isRightAnswerChecked = (
            quizEle.querySelector(
              `[data-choice="${rightChoice}"]`
            )! as HTMLInputElement
          ).checked;
          const quizResultEle = examSubmitResultstEle.querySelector(
            `[data-quiz="${quizName}"]`
          )! as HTMLDivElement;

          if (isRightAnswerChecked) {
            quizResultEle.classList.remove("false");
            quizResultEle.classList.add("true");
            ++correntCount;
          } else {
            quizResultEle.classList.remove("true");
            quizResultEle.classList.add("false");
          }
        });

        document.getElementById(
          "correctCount"
        )!.textContent = `${correntCount}/${this.totalQuizesCount}`;

        popupElement.querySelector(".quiz-submit")!.classList.add("show-up");
      },
      { signal: popupSignalController.signal }
    );

    // retake the test again
    document.getElementById("retakeTest")!.addEventListener(
      "click",
      () => {
        this.resetExamDOMState();
        this.quizesState = this.initialState;
        this.updateExamState();
        popupElement.querySelector(".quiz-submit")!.classList.remove("show-up");
      },
      {
        signal: popupSignalController.signal,
      }
    );
  }
}
