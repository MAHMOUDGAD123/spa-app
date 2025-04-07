import "@/styles/_index.css";
import "@/styles/fa/css/all.min.css";
import "@/components/link";
import "@/router";
import layout from "./layout.html?raw";
import "./layout.css";
import { _Storage } from "./utils/Storage";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = layout;

window.addEventListener("DOMContentLoaded", () => {
  // theme
  // ============================================================
  type ThemeButton = HTMLInputElement;
  type Theme = "d" | "s" | "l";

  const themeLocalStorageKey = "_it_leg_theme_";
  const darkBtn1 = document.getElementById("drkTheme") as ThemeButton;
  const darkBtn2 = document.getElementById("_drkTheme") as ThemeButton;
  const lightBtn1 = document.getElementById("litTheme") as ThemeButton;
  const lightBtn2 = document.getElementById("_litTheme") as ThemeButton;
  const systemBtn1 = document.getElementById("sysTheme") as ThemeButton;
  const systemBtn2 = document.getElementById("_sysTheme") as ThemeButton;

  // set initial theme
  const hash = new Map<Theme, ThemeButton[]>([
    ["d", [darkBtn1, darkBtn2]],
    ["s", [systemBtn1, systemBtn2]],
    ["l", [lightBtn1, lightBtn2]],
  ]);

  const lastUserTheme = _Storage.read(
    themeLocalStorageKey,
    "localStorage"
  ) as Theme;
  if (lastUserTheme) {
    hash.get(lastUserTheme)?.forEach((btn) => (btn.checked = true));
  } else {
    hash.get("s")!.forEach((btn) => (btn.checked = true));
  }

  darkBtn1.onclick = () => {
    darkBtn2.checked = true;
    _Storage.save(themeLocalStorageKey, "d", "localStorage");
  };
  darkBtn2.onclick = () => {
    darkBtn1.checked = true;
    _Storage.save(themeLocalStorageKey, "d", "localStorage");
  };

  systemBtn1.onclick = () => {
    systemBtn2.checked = true;
    _Storage.save(themeLocalStorageKey, "s", "localStorage");
  };
  systemBtn2.onclick = () => {
    systemBtn1.checked = true;
    _Storage.save(themeLocalStorageKey, "s", "localStorage");
  };

  lightBtn1.onclick = () => {
    lightBtn2.checked = true;
    _Storage.save(themeLocalStorageKey, "l", "localStorage");
  };
  lightBtn2.onclick = () => {
    lightBtn1.checked = true;
    _Storage.save(themeLocalStorageKey, "l", "localStorage");
  };

  // window scrolling
  // ============================================================
  const header = document.querySelector("header")!;
  const btt = document.getElementById("backToTop")!;

  const OnWindowScroll = async () => {
    // header behavior
    if (window.scrollY >>> 0 === 0) {
      header.classList.remove("scroll-down");
    } else {
      header.classList.add("scroll-down");
    }

    if (window.scrollY > 300) {
      btt.classList.add("show-up");
    } else {
      btt.classList.remove("show-up");
    }
  };
  OnWindowScroll();
  window.addEventListener("scroll", OnWindowScroll);

  btt.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // sideNav toggle
  // ============================================================
  document.getElementById("sideNav")!.onclick = (e) => {
    const target = e.target as HTMLElement;
    if (target === e.currentTarget || target.matches("[data-link]")) {
      const sideNavToggle = document.getElementById(
        "sideNavToggle"
      )! as HTMLInputElement;
      const checked = sideNavToggle.checked;
      sideNavToggle.checked = !checked;
    }
  };
});
