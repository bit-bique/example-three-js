import { useEffect, useState } from "react";

import { Type } from "./constant";
import Options from "./components/Config";
import useBlazepose from "./useBlazepose";
import Three from "./components/Three";

import ImageSrc from "./assets/yoga.jpeg";

function App() {
  const [selected, setSelected] = useState(null);
  const { start, clear } = useBlazepose();

  useEffect(() => {
    start(selected);
  }, [selected]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Options _onSetSelected={setSelected} _onClear={clear} />

      <div style={{ display: "flex" }}>
        <canvas
          id="output"
          style={{
            width: "640px",
            height: "480px",
            objectFit: "contain",
          }}
        />
        <Three />
      </div>
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
