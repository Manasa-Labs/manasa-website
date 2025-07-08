import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

export function Overlay() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <div className="absolute w-48 bottom-5 left-5 md:w-72 md:bottom-10 md:left-10 sm:w-64 sm:bottom-10 sm:left-10 lg:w-96 lg:bottom-12 lg:left-12 xl:w-72 2xl:w-96">
        <img src="logo-dark.png" alt="Manasa Logo" />
      </div>
      <div className="absolute hidden bottom-5 right-5 md:bottom-10 md:right-10 sm:bottom-10 sm:right-10 lg:bottom-12 lg:right-12 xl:bottom-10 xl:right-10 2xl:bottom-12 2xl:right-12 md:block">
        <a
          href="mailto:contact@manasa.ai"
          className="mt-4 text-2xl font-bold text-white md:text-3xl sm:text-3xl contact"
        >
          ask@manasa.ai
        </a>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Overlay />
  </>
);
