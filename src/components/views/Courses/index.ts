import "./courses.css";
import template from "./courses.html?raw";
import DummyView from "@/router/views/view";
import Router from "@/router/router";

type Specialities =
  | "c_sharp_basics"
  | "cpp"
  | "frontend"
  | "nodejs"
  | "dot_net_mobile"
  | "flutter"
  | "web_dev_dot_net"
  | "data_analysis"
  | "other";
type FilterId = `_${Specialities}_`;

export default class extends DummyView {
  dynamicRenderElementId: string = "courses_rt";
  readonly searchParams = Router.useSearchParams();

  // <filterId, pathQuery>
  private readonly filterMap = new Map<
    FilterId,
    { speciality: Specialities; name: string }
  >([
    [
      "_c_sharp_basics_",
      {
        speciality: "c_sharp_basics",
        name: "Programming Basics C#",
      },
    ],
    [
      "_cpp_",
      {
        speciality: "cpp",
        name: "Programming Basics C++",
      },
    ],
    [
      "_frontend_",
      {
        speciality: "frontend",
        name: "Front End",
      },
    ],
    [
      "_nodejs_",
      {
        speciality: "nodejs",
        name: "Web Dev Node.Js",
      },
    ],
    [
      "_dot_net_mobile_",
      {
        speciality: "dot_net_mobile",
        name: "Mobile Dev .Net",
      },
    ],
    [
      "_flutter_",
      {
        speciality: "flutter",
        name: "Mobile Dev Flutter",
      },
    ],
    [
      "_web_dev_dot_net_",
      {
        speciality: "web_dev_dot_net",
        name: "Web Dev .Net",
      },
    ],
    [
      "_data_analysis_",
      {
        speciality: "data_analysis",
        name: "Data Analysis",
      },
    ],
    [
      "_other_",
      {
        speciality: "other",
        name: "Other",
      },
    ],
  ]);

  constructor() {
    super("Courses");
  }

  async getStaticHTML() {
    return template;
  }

  async getDynamicHTML() {
    const speciality = this.searchParams.get("speciality");

    let coursesList = (await Router.dummyFetch("/db/courses-list.json")) as [
      string,
      Info.CourseInfo
    ][];

    if (speciality && this.filterMap.has(`_${speciality}_` as FilterId)) {
      coursesList = coursesList.filter((course) =>
        course[1].Speciality.includes(speciality)
      );
    }

    return coursesList
      .map(
        ([courseKey, courseInfo], i) => `
      <a-link to="/courses/[${courseKey}]" style="--i:${i}" class="course-card">
        <img src="/imgs/${courseInfo.img}.webp" alt="photo" loading="lazy" />
        <div class="details">
          <h4>${courseInfo.title}</h4>
          <h5 class="by">By: ${courseInfo.by}</h5>
          <hr />
          <h4 class="price">${
            courseInfo.price ? `${courseInfo.price} LE` : "Free"
          }</h4>
        </div>
      </a-link>
    `
      )
      .join("");
  }

  async beforeStaticHTMLRender(template: HTMLTemplateElement): Promise<void> {
    const filterElement = template.content.getElementById("coursesFilter")!;

    // add the filters to the DOM
    filterElement.innerHTML = [...this.filterMap.entries()]
      .map(
        ([id, { name }]) => `
        <input
          type="checkbox"
          name="filter"
          id="${id}"
          data-title="${name}"
          title="${name}"
        />`
      )
      .join("");
  }

  async afterStaticHTMLRender(): Promise<void> {
    this.setActiveFilter();

    // filter click event to update the DOM on any filter click
    const filterElement = document.getElementById("coursesFilter")!;
    filterElement.onclick = (e) => {
      const target = e.target as HTMLInputElement;
      const specialityData = this.filterMap.get(target.id as FilterId)!;

      if (specialityData) {
        const { name, speciality } = specialityData;
        const isChecked = target.checked;

        filterElement.childNodes.forEach((node) => {
          (node as HTMLInputElement).checked = false;
        });

        Router.navigateTo({
          path: "",
          query: isChecked ? `?speciality=${speciality}` : "",
          renderTargetId: this.dynamicRenderElementId,
          relative: true,
        });
        target.checked = isChecked;

        // set the title
        document.getElementById("_title")!.textContent = isChecked
          ? name
          : "Courses";
      }
    };
  }

  async afterDynamicHTMLRender(): Promise<void> {
    this.setActiveFilter();
  }

  // privates
  private async setActiveFilter(): Promise<void> {
    // set the active filter button after render
    for (const [id, { name, speciality }] of this.filterMap) {
      const ele = document.getElementById(id) as HTMLInputElement;

      if (this.searchParams.get("speciality") === speciality) {
        ele.checked = true;
        document.getElementById("_title")!.textContent = name;
      } else {
        ele.checked = false;
      }
    }
  }
}
