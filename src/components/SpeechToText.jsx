import React, { useState, useEffect } from "react";

const SpeechToTextForm = () => {
  const [activeInput, setActiveInput] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = "hi-IN"; 

      newRecognition.onresult = (event) => {
        if (activeInput) {
          let finalTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
          activeInput.value = finalTranscript;  
        }
      };

      setRecognition(newRecognition);
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  }, [activeInput]);

  const startListening = (event) => {
    event.preventDefault();
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = (event) => {
    event.preventDefault();
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <div>
      <h3>Speech to Text Form</h3>
      <input type="text" placeholder="Field 1" onFocus={(e) => setActiveInput(e.target)} />
      <input type="text" placeholder="Field 2" onFocus={(e) => setActiveInput(e.target)} />
      <input type="text" placeholder="Field 3" onFocus={(e) => setActiveInput(e.target)} />
      <br />
      <button onClick={startListening}>🎤 Start</button>
      <button onClick={stopListening}>🛑 Stop</button>
    </div>
  );
};

export default SpeechToTextForm;
