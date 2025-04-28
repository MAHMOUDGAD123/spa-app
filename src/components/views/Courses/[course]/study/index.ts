import "./study.css";
import htmlTemplate from "./study.html?raw";
import Router from "@/router/router";
import AbstractView from "@/router/views/view";
import { getFormData } from "@/utils/tools";
import { _Storage } from "@/utils/Storage";

export default class extends AbstractView {
  readonly params = Router.useParams() as {
    course: string;
  };
  private coursesList: Map<string, Info.CourseInfo> | null = null;
  private readonly abortControler: AbortController = new AbortController();

  constructor() {
    super();
    this.setTitle(`${this.params.course} | Study`);
  }

  async getStaticHTML() {
    return htmlTemplate;
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

    // set the course title
    _template.content.querySelector(".course-title")!.textContent = `${
      this.coursesList.get(course)!.title
    }`;

    // set the course route name
    _template.content.getElementById("courseRouteName")!.textContent = course;
  }

  async afterStaticHTMLRender(): Promise<void> {
    this.videoPlayerSetup();
    this.commentSectionSetup();
    this.courseProgressSetup();
    this.contentClickDelegationSetup();
  }

  async beforeUnmount(): Promise<void> {
    this.abortControler.abort();
  }

  // view setup and functions
  private async videoPlayerSetup(): Promise<void> {
    // video player click events
    // ================================================================
    const videoEle = document.getElementById("video")!;
    const video = videoEle.querySelector("video")!;
    const playIcon = videoEle.querySelector(".play")! as HTMLDivElement;
    const img = videoEle.querySelector("img")!;
    const fullWidthButton = videoEle.querySelector(
      ".full-width-btn"
    )! as HTMLDivElement;

    videoEle.addEventListener(
      "click",
      () => {
        video.play();
        img.style.display = "none";
        playIcon.style.display = "none";
        video.style.pointerEvents = "auto";
        fullWidthToggle.style.pointerEvents = "auto";

        videoEle.addEventListener(
          "click",
          (e) => {
            if (!(e.target as HTMLElement).closest(".full-width-btn")) {
              e.preventDefault();

              if (video.paused) {
                video.play();
              } else {
                video.pause();
              }
            }
          },
          { signal: this.abortControler.signal }
        );
      },
      { signal: this.abortControler.signal, once: true }
    );

    const playerWidthLocalStorageKey = "_it_leg_player-fw_";
    const fullWidthToggle = document.getElementById(
      "fullWidthToggle"
    ) as HTMLInputElement;

    // set the video player width at start up
    fullWidthToggle.checked = !!_Storage.read(
      playerWidthLocalStorageKey,
      "localStorage"
    );

    // video player full-width event
    fullWidthButton.addEventListener("click", async () => {
      if (fullWidthToggle.checked) {
        _Storage.save(playerWidthLocalStorageKey, true, "localStorage");
      } else {
        _Storage.delete(playerWidthLocalStorageKey, "localStorage");
      }
    });
    // ================================================================
  }

  private async commentSectionSetup(): Promise<void> {
    // comment submit
    // ================================================================
    const formEle = document.getElementById("commetForm") as HTMLFormElement;
    formEle.addEventListener("submit", (e) => {
      e.preventDefault();

      const fakeUsers: { name: string; gender: 0 | 1 }[] = [
        {
          name: "Mahmoud Gad",
          gender: 1,
        },
        {
          name: "Amira Gad",
          gender: 0,
        },
        {
          name: "Hossam Samy",
          gender: 1,
        },
        {
          name: "Doaa Shady",
          gender: 0,
        },
        {
          name: "Amr Gamal",
          gender: 1,
        },
        {
          name: "Mohammed Khalid",
          gender: 1,
        },
        {
          name: "Reem Fathy",
          gender: 0,
        },
      ];

      const { commentIn } = getFormData(formEle) as {
        commentIn: string;
      };

      const randomUser = fakeUsers[(Math.random() * fakeUsers.length) >>> 0];

      const div = document.createElement("div");
      div.className = "comment";

      const genderText = randomUser.gender ? "male" : "female";
      div.innerHTML = `
            <img src="${genderText}.svg" alt="${genderText}" />

            <div class="comment-details">
              <h5 class="user-name">${randomUser.name}</h5>
              <span class="date">${new Date().toDateString()}</span>
              <p class="comment-body">${commentIn}</p>
            </div>
      `;

      // add the comment to the DOM
      document.getElementById("commentsList")!.appendChild(div);
      // clear the text area
      (document.getElementById("commentIn")! as HTMLTextAreaElement).value = "";
    });
    // ================================================================
  }

  private async courseProgressSetup(): Promise<void> {
    // study progress
    const studyProgress = document.getElementById("studyProgress")!;
    const progressPercentage = document.getElementById("progressPercentage")!;
    const { course } = this.params;
    const courseData = this.coursesList!.get(course)!;

    const animateProgress = () => {
      const start = performance.now(); // Get start time
      const duration = 1500; // Total animation time (in ms)
      const targetProgress = courseData.progress;

      const step: FrameRequestCallback = (now) => {
        const delta = now - start;
        const progress = Math.min(
          (delta / duration) * targetProgress,
          targetProgress
        ); // Calculate smooth progress

        studyProgress.style.width = `${progress}%`;
        progressPercentage.textContent = `${progress >>> 0}%`;

        if (progress < targetProgress) {
          requestAnimationFrame(step); // Continue animation
        }
      };

      requestAnimationFrame(step); // Start animation
    };

    const inViewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log("Progress inView");
            animateProgress();
            inViewObserver.disconnect();
          }
        });
      },
      { threshold: 1 }
    );

    inViewObserver.observe(studyProgress);
  }

  private async contentClickDelegationSetup(): Promise<void> {
    // content click event (event delegation)
    type DatasetList = {
      clickDelegation: boolean;
      action: "intoView";
      targetid: string;
    };

    // actions
    const scrollIntoViewAndSign = (targetid: string) => {
      const target = document.getElementById(targetid)!;
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
      target.classList.add("signed");
      setTimeout(() => {
        target?.classList.remove("signed");
      }, 3000);
    };

    document.getElementById("sectionsIcons")!.addEventListener("click", (e) => {
      const clickTarget = e.target as HTMLElement;

      if (clickTarget.closest("[data-clickDelegation]")) {
        const dataSet = clickTarget.dataset as unknown as DatasetList;
        const { action, targetid } = dataSet;

        switch (action) {
          case "intoView":
            scrollIntoViewAndSign(targetid);
            break;
        }
      }
    });
  }
}
