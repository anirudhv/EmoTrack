import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from "react-webcam";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';
 
function App() {
  const video1 = document.getElementById("video");
  const[canvas, setCanvas] = useState(null);
  const[isPlaying, setisPlaying] = useState(false);
  const[isLoaded, setisLoaded] = useState(false);
  const[tracking, setTracking] = useState(false);
  const height = 560;
  const width = 720;
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const[data, setData] = useState([]);
  const trackingRef = useRef({
    tracking, data
  });
  console.log(data)

  useEffect(()=> {

  })

  useEffect(()=> {
    Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(()=> {
      if(navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio:false, video:true })
          .then((stream) => {
            console.log(stream)
            const video = document.getElementById("video");
            videoRef.current.srcObject = stream;
            console.log("video is " + video)
            video.play();
            setisLoaded(true);
            addEvent();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    });
    }, []);

      const addEvent = () => {
        console.log("Inside")
        const video = document.getElementById("video");
        video.addEventListener("play", () => {
          const canvas = faceapi.createCanvas(video);
          canvas.id = "canvas";
          document.querySelector("#video").append(canvas);
          document.body.append(canvas);
          const displaySize = { width:width, height:height };
          faceapi.matchDimensions(canvas, displaySize);
          setInterval(async () => {
            const detections = await faceapi.detectAllFaces('video', new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas
              .getContext("2d")
              .clearRect(0, 0, canvas.width, canvas.height);
            // faceapi.draw.drawDetections(canvas, resizedDetections);
            // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            //console.log(data);
            if(resizedDetections[0].expressions !== undefined && resizedDetections[0].expressions && trackingRef.current.tracking) {
              const exp = {...resizedDetections[0].expressions};
              exp.name = data.length/10;
              setData(arr => [...arr, resizedDetections[0].expressions]);
            }
          }, 100);
        })
      }

  const startTracking = ()  => {
    if(!tracking) {
      setData(() => {
        trackingRef.current.data = [];
        return [];
      });
    }
    setTracking(() => {
      trackingRef.current.tracking = true;
      return true;
    });
    console.log(tracking)
  }
  const stopTracking = () => {
    setTracking(() => {
      trackingRef.current.tracking = false;
      return false;
    });
  }

  return (
    <div>
    <div id="main">
      <Webcam
        id="video"
        src={video1}
        ref={videoRef}
        autoPlay={true}
        audio={false}
        width={width}
        height={height}
        playsInline
        muted
        style={{ width: "720px", height: "560px" }}
       />
      <canvas
        id="canvas"
        ref={canvasRef}
        style={{ width: "720px", height: "560px" }}
      />
      </div>
      <button id="startBtn" onClick={startTracking}>Start Tracking</button>
      {tracking && <h1 id="trackingText">Tracking in Progress</h1>}
      <button id = "stopBtn" onClick={stopTracking}>Stop Tracking</button>
        {!tracking && data.length && (
        <div id="dashboard">
          <h1>Dashboard</h1>
              <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                  top:5,
                  right:30,
                  left:20,
                  bottom:5
                }}
              >
                <CartesianGrid strokeDasharray = "3 3"  />
                <XAxis dataKey = "name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="monotone" stroke="#9400D3" activeDot={{r: 8}} />
                <Line type="monotone" dataKey="happy" stroke="#4B0082" />
                <Line type="monotone" dataKey="sad" stroke="#0000FF" />
                <Line type="monotone" dataKey="angry" stroke="#8884d8" />
                <Line type="monotone" dataKey="fearful" stroke="#00FF00" />
                <Line type="monotone" dataKey="disgusted" stroke="#000000" />
                <Line type="monotone" dataKey="surprised" stroke="#FF7F00" />
              </LineChart>
          </div>
        )}

    </div>
  );
}

export default App;