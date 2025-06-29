import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('javascript');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState('');
  const promptRef = useRef(null);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSubmit = async (action) => {
    const prompt = promptRef.current?.value || action;
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/generate', {
        prompt: `${action}: ${code}\n\n${prompt}`,
        context: conversationContext
      });
      
      setAiResponse(response.data.response);
      setConversationContext(prev => `${prev}\n\nUser: ${prompt}\nAI: ${response.data.response}`);
    } catch (error) {
      console.error('Error:', error);
      setAiResponse('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCode = async () => {
  setIsLoading(true);
  try {
    const response = await axios.post('http://localhost:3001/api/execute', {
      code,
      language
    });
    setAiResponse(response.data.output);
  } catch (error) {
    setAiResponse('Failed to execute code');
  } finally {
    setIsLoading(false);
  }
};

// Add to toolbar:
<button onClick={handleRunCode}>Run Code</button>

  return (
    <div className="editor-container">
      <div className="toolbar">
        <select value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        
        <button onClick={() => handleSubmit('Explain this code')}>
          Explain
        </button>
        <button onClick={() => handleSubmit('Debug this code')}>
          Debug
        </button>
        <button onClick={() => handleSubmit('Optimize this code')}>
          Optimize
        </button>
      </div>

      <div className="editor-wrapper">
        <Editor
          height="60vh"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on'
          }}
        />
      </div>

      <div className="ai-interaction">
        <input
          type="text"
          ref={promptRef}
          placeholder="Ask AI about your code..."
        />
        <button onClick={() => handleSubmit('')}>
          Ask AI
        </button>
      </div>

      <div className="ai-response">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <pre>{aiResponse}</pre>
        )}
      </div>
    </div>
  );
};

export default CodeEditor; 