import React from 'react';
import './App.scss';
import Canvas from './components/Canvas';
import Editor from './components/Editor';
import Control from './components/Control';

function App() {
  return (
    <main>
      <Canvas />
      <div className='panels' id='rightPanel'>
        <Editor />
        <Control />
      </div>
    </main>
  );
}

export default App;
