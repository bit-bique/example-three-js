import { useEffect, useState } from "react";

import useBlazepose from "./useBlazepose";

function App() {
  useBlazepose();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <canvas id="output"></canvas>
      <video
        id="video"
        autoPlay
        playsInline
        style={{
          transform: "scaleX(-1)",
          visibility: "hidden",
        }}
      ></video>
    </div>
  );
}

export default App;
