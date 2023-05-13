import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import './App.css';

function Hello() {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(false);
  window.electron.ipcRenderer.once('ipc-example', (arg) => {
    // eslint-disable-next-line no-console
    console.log('arg ===', arg);
    setBuckets(arg?.split('\n'));
    setLoading(false);
  });
  const refreshBuckets = () => {
    setLoading(true);
    window.electron.ipcRenderer.sendMessage('ipc-example', 'refersh-buckets');
  };

  return (
    <div style={{ padding: 10 }}>
      <h1>S3 Explorer (using aws cli)</h1>
      <h2>
        Buckets{' '}
        <button type="button" onClick={refreshBuckets}>
          Refresh
        </button>
      </h2>{' '}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ maxHeight: '70vh', overflowY: 'scroll', width: '100%' }}>
          {buckets.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      )}
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
