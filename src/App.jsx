import "./App.css";
import bgVideo from "./assets/bg.mp4";
import manasaLogo from "./assets/logo-dark.png";

function App() {
  return (
    <div className="app-container">
      <video className="background-video" autoPlay loop muted>
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="overlay"></div>
      <img src={manasaLogo} className="logo" alt="Logo" />
    </div>
  );
}

export default App;
