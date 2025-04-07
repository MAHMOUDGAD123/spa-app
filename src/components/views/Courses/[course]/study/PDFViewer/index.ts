import "./PDFViewer.css";
import htmlString from "./PDFViewer.html?raw";
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
    this.setTitle(`${this.params.course} | Study | PDF`);
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
    this.PDFPopupSetup();
  }

  private async PDFPopupSetup(): Promise<void> {
    console.log("PDF popup");

    const { popupElement, popupSignalController } = this.popupControls!;

    const pdfPages = popupElement.querySelector(
      ".pdf-pages"
    )! as HTMLDivElement;

    // click control
    popupElement.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement;

        if (target.matches(".pdf-scrolldown")) {
          pdfPages.scrollBy({ behavior: "smooth", top: 100 });
        } else if (target.matches(".pdf-scrollup")) {
          pdfPages.scrollBy({ behavior: "smooth", top: -100 });
        } else if (target.matches(".pdf-download")) {
          document.getElementById("downloadPDF")!.click();
        }
      },
      { signal: popupSignalController.signal }
    );

    // change page by clicking (arrow-up) and (arrow-down)
    document.addEventListener(
      "keydown",
      (e) => {
        switch (e.code) {
          case "ArrowUp":
            (popupElement.querySelector(
              ".pdf-scrollup"
            ) as HTMLButtonElement)!.click();
            break;
          case "ArrowDown":
            (popupElement.querySelector(
              ".pdf-scrolldown"
            ) as HTMLButtonElement)!.click();
            break;
          case "Escape":
            (popupElement.querySelector(
              ".pdf-close"
            ) as HTMLButtonElement)!.click();
            break;
        }
      },
      { signal: popupSignalController.signal }
    );
  }
}
