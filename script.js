// script.js
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

const pose = new Pose.Pose({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

pose.onResults(results => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    const lm = results.poseLandmarks;

    const leftShoulder = lm[11];
    const rightShoulder = lm[12];
    const nose = lm[0];

    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y).toFixed(3);
    const headTilt = (nose.x - ((leftShoulder.x + rightShoulder.x) / 2)).toFixed(3);

    const postureScore = 10 - (shoulderDiff * 10 + Math.abs(headTilt) * 10);
    const boundedScore = Math.max(0, Math.min(10, postureScore)).toFixed(1);

    document.getElementById('shoulder-diff').innerText = `Shoulder Diff: ${shoulderDiff}`;
    document.getElementById('head-tilt').innerText = `Head Tilt: ${headTilt}`;
    document.getElementById('posture-score').innerText = `Posture Score: ${boundedScore}`;
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 640,
  height: 480,
});
camera.start();
