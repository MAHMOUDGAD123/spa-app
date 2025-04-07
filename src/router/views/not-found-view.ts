import DummyView from "@/router/views/view";
import Router from "@/router/router";
import notFound from "@/components/views/not-found.html?raw";

export default class extends DummyView {
  constructor() {
    super("404");
  }

  async beforeStaticHTMLRender(_template: HTMLTemplateElement): Promise<void> {
    _template.content.querySelector(
      ".route"
    )!.textContent = `${Router.currentPath}`;
  }

  async getStaticHTML() {
    return notFound;
  }
}
