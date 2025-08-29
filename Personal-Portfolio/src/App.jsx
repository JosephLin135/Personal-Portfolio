import React, { useState, useEffect, useRef } from 'react';
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(true);
  const chatBodyRef = useRef();

  const generateBotResponse = async ( history ) => {

    const updateHistory = ( text, isError = false ) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), {role: "model", text, isError}]);
    };

    history = history.map(({role, text}) => ({role, parts: [{text}]}));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, requestOptions);
      const data = await response.json();
      if(!response.ok) throw new Error(data.message || 'Something went wrong');

      const apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      updateHistory(apiResponse);
    } catch(error) {
      updateHistory(error.message, true);
    }
  };


  useEffect(() => {
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth"});
  }, [chatHistory]);

  return ( 
  <div className={`container ${showChatbot ? "show-chatbot": ""}`}>
    <button onClick={() => setShowChatbot(prev => !prev)} id="chatbot-toggler">
      <span className="material-symbols-rounded">mode_comment</span>
      <span className="material-symbols-rounded">close</span>
    </button>

    <div className="chatbot-popup">
      <div className="chat-header">
        <div className="header-info">
          <ChatbotIcon />
          <h2 className="logo-text">ConvoBot</h2>
        </div>

        <button className="material-symbols-rounded" onClick={() => setShowChatbot(false)}>keyboard_arrow_down
        </button>
      </div>

      <div ref={chatBodyRef} className="chat-body">
        <div className="message bot-message">
        <ChatbotIcon />
        <p className="message-text">
          Hey there! <br /> How can I help you today?
        </p>
        </div>

        {chatHistory.map((chat, index) => (
          <ChatMessage key={index} chat={chat} />
        ))}
      </div>

      <div className="chat-footer">
        <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
      </div>
    </div>
  </div>
  );
};

export default App;