import "./home.css";
import template from "./home.html?raw";
import DummyView from "@/router/views/view";

export default class extends DummyView {
  constructor() {
    super("Home");
  }

  async getStaticHTML() {
    return template;
  }
}
