import { AnimatePresence, motion } from "motion/react";
import { Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
const LazyApp = lazy(() => import("./App.jsx"));

const headlines = [
  <>
    Your competitors are already using AI.{" "}
    <span className="text-red-500">Are you?</span>
  </>,
  <>
    Slash costs by 40% <span className="text-red-500">with AI.</span>
  </>,
  <>
    We build AI systems that make your business{" "}
    <span className="text-red-500">run itself.</span>
  </>,
  <>
    AI is reshaping operations.{" "}
    <span className="text-red-500">You have 16 weeks to lead or lag.</span>
  </>,
];

function RotatingHeadline({ texts, interval = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.14, ease: "easeInOut" }}
        className="inline-block"
      >
        <h1 className="mb-4 text-3xl font-bold text-white sm:text-5xl font-display">
          {texts[currentIndex]}
        </h1>
      </motion.span>
    </AnimatePresence>
  );
}

export function Overlay() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <div className="absolute inset-0 z-0 bg-black/30" />

      <section className="relative z-10 max-w-2xl px-4 mx-auto text-center -translate-y-1/2 top-1/2">
        <RotatingHeadline texts={headlines} interval={5000} />
        <p className="mb-8 text-lg text-gray-200 sm:text-xl">
          Transform your operations in just 16 weeks—scalable, efficient,
          future-ready.
        </p>
        <a
          href="https://cal.com/manasa-labs/free-strategic-roadmap"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get a Free Strategic Roadmap"
          onClick={() =>
            gtag("event", "cta_click", {
              event_category: "engagement",
              event_label: "free_strategic_roadmap",
            })
          }
          style={{ pointerEvents: "auto" }}
          className="inline-block px-6 py-3 font-medium text-black transition bg-white rounded-full shadow-lg hover:bg-red-500 hover:text-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          <span>Get your Free Strategic Roadmap →</span>
        </a>
      </section>
      <div className="absolute w-48 bottom-5 left-5 md:w-72 md:bottom-10 md:left-10 sm:w-64 sm:bottom-10 sm:left-10 lg:w-96 lg:bottom-12 lg:left-12 xl:w-72 2xl:w-96">
        <img src="logo-dark.png" alt="Manasa Logo" />
      </div>
      <div className="absolute hidden bottom-5 right-5 md:bottom-10 md:right-10 sm:bottom-10 sm:right-10 lg:bottom-12 lg:right-12 xl:bottom-10 xl:right-10 2xl:bottom-12 2xl:right-12 md:block">
        <a
          href="mailto:contact@manasa.ai"
          onClick={() =>
            gtag("event", "email_click", {
              event_category: "contact",
              event_label: "ask@manasa.ai",
            })
          }
          className="mt-4 text-2xl font-bold text-white transition duration-300 border-b-2 border-white-400 md:text-3xl sm:text-3xl contact hover:border-red-500 hover:text-red-500"
        >
          ask@manasa.ai
        </a>
      </div>
    </div>
  );
}

function BackgroundSwitcher() {
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    // Hardware capabilities with safe defaults
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = navigator.deviceMemory || 4;

    // Network detection
    const isSlowConnection =
      navigator.connection &&
      (navigator.connection.saveData ||
        /2g|slow-2g/i.test(navigator.connection.effectiveType));

    // Set low-power mode if any condition matches
    if (hardwareConcurrency < 4 || deviceMemory < 4 || isSlowConnection) {
      setIsLowPower(true);
      // Track low power mode activation
      if (typeof gtag === "function") {
        gtag("event", "low_power_mode_activated", {
          event_category: "performance",
          event_label: "device_detected",
        });
      }
    }
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {isLowPower ? (
        // Fallback for low-power devices
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src="fallback.mp4" type="video/mp4" />
          </video>
        </div>
      ) : (
        <Suspense fallback={null}>
          <LazyApp />
        </Suspense>
      )}
      <Overlay />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <>
    <BackgroundSwitcher />
  </>
);
