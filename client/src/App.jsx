import './App.css';
import CodeEditor from './components/CodeEditor';

function App() {
  return (
    <div className="App">
      <header>
        <h1>AI Code Editor</h1>
      </header>
      <main>
        <CodeEditor />
      </main>
    </div>
  );
}

export default App;