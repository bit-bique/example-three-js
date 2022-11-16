import { useEffect, useState } from "react";
import browserVersion from "./libs/browserVersion";

import { Type } from "./constant";
import Options from "./components/Config";
import useBlazepose from "./useBlazepose";
import Three from "./components/Three";

import ImageSrc from "./assets/yoga.jpeg";

function App() {
  const [selected, setSelected] = useState(null);
  const { start, clear } = useBlazepose();
  const version = browserVersion();

  useEffect(() => {
    if (selected) start(selected);
  }, [selected]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Options _onSetSelected={setSelected} _onClear={clear} />
      <span style={{ color: "black" }}>{version}</span>

      <Three />
      <canvas
        id="output"
        style={{
          width: "640px",
          height: "480px",
          objectFit: "contain",
        }}
      />

      {selected === Type.Camera && (
        <video
          id="video"
          autoPlay
          playsInline
          style={{
            transform: "scaleX(-1)",
            display: "none",
            width: "640px",
            height: "480px",
          }}
        />
      )}
      {(selected === Type.VideoSolo || selected === Type.VideoGroup) && (
        <video
          id="video"
          autoPlay
          playsInline
          loop
          controls
          muted
          style={{
            width: "640px",
            height: "480px",
          }}
        />
      )}
      <img
        id="image"
        alt="preview-img"
        src={ImageSrc}
        style={{
          display: "none",
        }}
      />
    </div>
  );
}

export default App;
