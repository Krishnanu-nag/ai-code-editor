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
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/generate', {
        prompt: `${action}: ${code}\n\n${prompt}`,
        context: conversationContext
      });

      setAiResponse(response.data.response);
      setConversationContext(prev => `${prev}\n\nUser: ${prompt}\nAI: ${response.data.response}`);
      promptRef.current.value = '';
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
      const response = await axios.post('http://localhost:3001/api/execute', { code, language });
      setAiResponse(response.data.output);
    } catch (error) {
      setAiResponse('Failed to execute code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit('');
    }
  };

  return (
    <div className="editor-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toolbar */}
      <div className="toolbar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <button onClick={() => handleSubmit('Explain this code')}>Explain</button>
        <button onClick={() => handleSubmit('Debug this code')}>Debug</button>
        <button onClick={() => handleSubmit('Optimize this code')}>Optimize</button>
        <button onClick={handleRunCode}>Run Code</button>
      </div>

      {/* Editor */}
      <div className="editor-wrapper" style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
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

      {/* Ask AI + AI Response Column */}
      <div className="ai-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="ai-interaction" style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            ref={promptRef}
            placeholder="Ask AI about your code..."
            onKeyDown={handleKeyPress}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button onClick={() => handleSubmit('')}>Ask AI</button>
        </div>

        <div className="ai-response" style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px', minHeight: '100px', backgroundColor: '#1e1e1e', color: '#fff' }}>
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <pre className="text-response">{aiResponse}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
