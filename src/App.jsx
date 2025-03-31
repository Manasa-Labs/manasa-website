import "./App.css";
import manasaLogo from "./assets/logo-dark.png";

function App() {
  const videos = ["/bg.mp4", "/bg-alt.mp4"];
  const randomVideo = videos[Math.floor(Math.random() * videos.length)];

  return (
    <div className="app-container">
      <video className="background-video" autoPlay loop muted>
        <source src={randomVideo} type="video/mp4" />
      </video>
      <div className="overlay"></div>
      <img src={manasaLogo} className="logo" alt="Logo" />
    </div>
  );
}

export default App;
