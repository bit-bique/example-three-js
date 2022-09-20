import { useEffect, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import FPSStats from "react-fps-stats";

const scoreThreshold = 0.6;
let video, canvas, ctx;
let model, detector;

function App() {
  useEffect(() => {
    video = document.getElementById("video");
    canvas = document.getElementById("output");
    ctx = canvas.getContext("2d");
    console.log("video", video);
    console.log("canvas", canvas);
    console.log("ctx", ctx);

    (async () => {
      await createDetector();
      await activateVideo();
    })();
  }, []);

  const createDetector = async () => {
    model = poseDetection.SupportedModels.BlazePose;
    const detectorConfig = {
      runtime: "tfjs",
      enableSmoothing: true,
      modelType: "full",
    };
    detector = await poseDetection.createDetector(model, detectorConfig);
  };

  const activateVideo = async () => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: "640",
            height: "480",
          },
        })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((e) => {
          console.log("Error occurred while getting the video stream");
        });
    }

    video.onloadedmetadata = () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      video.width = videoWidth;
      video.height = videoHeight;
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Because the image from camera is mirrored, need to flip horizontally.
      ctx.translate(videoWidth, 0);
      ctx.scale(-1, 1);
    };

    video.addEventListener("loadeddata", predictPoses);
  };

  const predictPoses = async () => {
    let poses = null;

    if (detector != null) {
      try {
        poses = await detector.estimatePoses(video, {
          flipHorizontal: false,
        });
      } catch (error) {
        detector.dispose();
        detector = null;
        alert(error);
      }
    }
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    if (poses && poses.length > 0) {
      for (const pose of poses) {
        if (pose.keypoints != null) {
          drawKeypoints(pose.keypoints);
          drawSkeleton(pose.keypoints);
        }
      }
    }

    window.requestAnimationFrame(predictPoses);
  };

  const drawKeypoints = (keypoints) => {
    ctx.fillStyle = "Green";
    ctx.strokeStyle = "White";
    ctx.lineWidth = 2;
    for (let i = 0; i < keypoints.length; i++) {
      drawKeypoint(keypoints[i]);
    }
  };

  const drawKeypoint = (keypoint) => {
    const radius = 4;
    if (keypoint.score >= scoreThreshold) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, radius, 0, 2 * Math.PI);
      ctx.fill(circle);
      ctx.stroke(circle);
    }
  };

  const drawSkeleton = (keypoints) => {
    const color = "#fff";
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    poseDetection.util.getAdjacentPairs(model).forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];
      if (kp1.score >= scoreThreshold && kp2.score >= scoreThreshold) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FPSStats />

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
