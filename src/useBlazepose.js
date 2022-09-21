import { useEffect, useRef } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import { Type } from "./constant";
import useStats from "./useStats";

import VideoSoloSrc from "./assets/video-solo.mp4";
import VideoGroupSrc from "./assets/video-group.mp4";

const scoreThreshold = 0.6;
let video, img;
let canvas, ctx;
let model, detector;

const useBlazepose = () => {
  const { animate } = useStats();
  const posesAnimationFrameRef = useRef();
  const fpsAnimationFrameRef = useRef();

  const start = async (type) => {
    video = document.getElementById("video");
    img = document.getElementById("image");
    canvas = document.getElementById("output");
    ctx = canvas.getContext("2d");
    clear();

    await createDetector();

    switch (type) {
      case Type.Camera:
        return await activateCamera();
      case Type.Image:
        return await activateImage();
      case Type.VideoSolo:
      case Type.VideoGroup:
        return await activateVideo(type);
      default:
    }
  };

  const clear = () => {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cancelAnimationFrame(posesAnimationFrameRef.current);
    cancelAnimationFrame(fpsAnimationFrameRef.current);
  };

  const createDetector = async () => {
    model = poseDetection.SupportedModels.BlazePose;
    const detectorConfig = {
      runtime: "tfjs",
      enableSmoothing: true,
      modelType: "full",
    };
    detector = await poseDetection.createDetector(model, detectorConfig);
  };

  const activateVideo = async (type) => {
    if (type === Type.VideoSolo) video.src = VideoSoloSrc;
    else if (type === Type.VideoGroup) video.src = VideoGroupSrc;

    video.onloadedmetadata = () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      video.width = videoWidth;
      video.height = videoHeight;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    };

    video.addEventListener("loadeddata", () => predictPoses(video));
  };

  const activateImage = async () => {
    canvas.width = img.width;
    canvas.height = img.height;

    predictPoses(img, false);
  };

  const activateCamera = async () => {
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

    video.addEventListener("loadeddata", () => predictPoses(video));
  };

  const predictPoses = async (element, isLoop = true) => {
    let poses = null;

    if (detector != null) {
      try {
        poses = await detector.estimatePoses(element, {
          flipHorizontal: false,
        });
      } catch (error) {
        detector.dispose();
        detector = null;
        alert(error);
      }
    }
    ctx.drawImage(element, 0, 0, element.width, element.height);
    fpsAnimationFrameRef.current = requestAnimationFrame(animate);

    if (poses && poses.length > 0) {
      for (const pose of poses) {
        if (pose.keypoints != null) {
          drawKeypoints(pose.keypoints);
          drawSkeleton(pose.keypoints);
        }
      }
    }

    if (isLoop)
      posesAnimationFrameRef.current = requestAnimationFrame(() =>
        predictPoses(element)
      );
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

  return { start, clear };
};

export default useBlazepose;
