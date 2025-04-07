import Router from "@/router/router";

export default class AbstractLink extends HTMLElement {
  constructor(private readonly type: "link" | "nav-link") {
    super();
    const to = this.getAttribute("to")!;
    const parent = this.parentElement!;
    const children = this.innerHTML;
    const replace = this.hasAttribute("replace");
    const renderTargetId = this.getAttribute("render-target");
    const isStrictActive = this.hasAttribute("strict-active");
    const isRelative = this.hasAttribute("relative");
    const className = this.getAttribute("class");
    const ID = crypto.randomUUID().split("-")[0];
    const linkData = `data-link='${ID}'${
      this.type === "nav-link" ? " data-nav" : ""
    }`;

    // replace the element with an new anchor tag
    this.outerHTML = `<a ${linkData}></a>`;

    const linkEle = parent.querySelector(
      `[data-link='${ID}']`
    )! as Types.AbstractLinkType;

    if (className) {
      linkEle.className = className;
    }

    linkEle.style = this.style.cssText;
    linkEle.to = to;
    linkEle.href = Router.getPathQuery() + to;
    linkEle.renderTarget = renderTargetId;
    linkEle.strictActive = isStrictActive;
    linkEle.replace = replace;
    linkEle.relative = isRelative;
    linkEle.dataset.link = "";
    linkEle.innerHTML = children;
  }
}
