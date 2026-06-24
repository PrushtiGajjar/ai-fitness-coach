"use client";
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';

export default function LiveWorkout({ onEnd }: { onEnd: () => void }) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState<string>("-");
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  
  const stageRef = useRef(stage);
  const repsRef = useRef(reps);
  
  const requestRef = useRef<number | undefined>(undefined);
  const poseRef = useRef<any>(null);

  useEffect(() => {
    stageRef.current = stage;
    repsRef.current = reps;
  }, [stage, reps]);

  const calculateAngle = (a: any, b: any, c: any) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  useEffect(() => {
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = "anonymous";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"),
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js")
    ]).then(() => {
        setScriptsLoaded(true);
    }).catch(err => console.error("Failed to load MediaPipe Scripts", err));
  }, []);

  useEffect(() => {
    if (!scriptsLoaded) return;

    const w = window as any;
    const pose = new w.Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    poseRef.current = pose;

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results: any) => {
      const videoWidth = webcamRef.current?.video?.videoWidth;
      const videoHeight = webcamRef.current?.video?.videoHeight;
      if (!videoWidth || !videoHeight) return;

      if (canvasRef.current) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        const canvasCtx = canvasRef.current.getContext('2d');
        if (canvasCtx) {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
          
          if (results.poseLandmarks) {
            // Fresh, Clean tracking
            w.drawConnectors(canvasCtx, results.poseLandmarks, w.POSE_CONNECTIONS, { color: '#ffffff', lineWidth: 4 });
            w.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#10b981', lineWidth: 2, radius: 4 });

            const landmarks = results.poseLandmarks;
            const hip = landmarks[23];
            const knee = landmarks[25];
            const ankle = landmarks[27];

            if (hip && knee && ankle && hip.visibility > 0.5 && knee.visibility > 0.5 && ankle.visibility > 0.5) {
                const angle = calculateAngle(hip, knee, ankle);
                
                canvasCtx.font = "bold 24px Outfit";
                canvasCtx.fillStyle = "#10b981";
                canvasCtx.fillText(Math.round(angle).toString() + "°", knee.x * videoWidth + 20, knee.y * videoHeight);

                if (angle > 160) {
                  setStage("UP");
                }
                if (angle < 90 && stageRef.current === "UP") {
                  setStage("DOWN");
                  setReps(repsRef.current + 1);
                }
            }
          }
          canvasCtx.restore();
        }
      }
    });

    const detectPose = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        await poseRef.current?.send({ image: video });
      }
      requestRef.current = requestAnimationFrame(detectPose);
    };

    detectPose();

    return () => {
      if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
      poseRef.current?.close();
    };
  }, [scriptsLoaded]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900 rounded-2xl shadow-2xl m-4 border-4 border-white">
      {!scriptsLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-sage-500 rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold tracking-[0.1em] text-slate-800 uppercase animate-pulse">
            Warming up camera...
          </h2>
        </div>
      )}
      
      <Webcam
        ref={webcamRef}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 pointer-events-none"></div>
      
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", zIndex: 10, transform: "scaleX(-1)" }}
      />
      
      {/* Clean HUD */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 z-20 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl min-w-[250px]"
      >
        <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-sage-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">Live Form</p>
        </div>
        <h2 className="text-7xl font-black text-slate-800 mb-2 tracking-tighter">
          {reps}
        </h2>
        <p className="text-lg font-bold text-sage-500 tracking-widest uppercase">Total Reps</p>
        
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-400 uppercase tracking-widest mb-1">Current Position</p>
          <p className="text-2xl font-bold text-slate-800">{stage}</p>
        </div>
      </motion.div>

      <motion.button 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
          fetch(`${API_URL}/api/workout/save`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ workout_name: "Squats", reps_completed: repsRef.current })
          }).then(() => onEnd()).catch(err => {
            console.error(err);
            onEnd();
          });
        }} 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 glass-button px-12 py-5 text-xl tracking-widest uppercase"
      >
        Finish Workout
      </motion.button>
    </div>
  );
}
