import "./about.css";
import template from "./about.html?raw";
import DummyView from "@/router/views/view";

export default class extends DummyView {
  constructor() {
    super("About US");
  }

  async getStaticHTML() {
    return template;
  }

  async afterStaticHTMLRender(): Promise<void> {
    document.getElementById("pages")!.onscrollend = (e) => {
      const docsEle = e.currentTarget as HTMLDivElement;
      const gapValue = 3; // px
      const btt = document.getElementById("btt")!;
      const h = Math.ceil(docsEle.getBoundingClientRect().height) + gapValue;
      const scrollTop = Math.ceil(docsEle.scrollTop);
      const show = scrollTop > h + gapValue;
      btt.style.visibility = `${show ? "visible" : "hidden"}`;
    };

    document.getElementById("btt")!.onclick = () => {
      document
        .getElementById("pages")!
        .scrollTo({ top: 0, behavior: "smooth" });
    };
  }
}
