import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import './App.css';

function Hello() {
  const [buckets, setBuckets] = useState([]);
  window.electron.ipcRenderer.once('ipc-example', (arg: any) => {
    // eslint-disable-next-line no-console
    console.log('arg ===', arg);
    setBuckets(arg?.split('\n'));
    // console.log(arg);s
  });
  return (
    <div>
      {/* <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div> */}
      {/* <h1>electron-react-boilerplate</h1> */}

      <div>
        {/* <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a> */}
        <h1>S3 Explorer</h1>
        <h2>Buckets</h2>
        <div style={{ maxHeight: '70vh', overflow: 'scroll' }}>
          {buckets.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
