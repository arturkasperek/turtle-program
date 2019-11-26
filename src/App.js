import React from 'react';
import './App.scss';
import CanvasDrawer from './components/CanvasDrawer';
import Editor from './components/Editor';
import Control from './components/Control';

function App() {
  return (
    <main>
      <CanvasDrawer />
      <div className='panels' id='rightPanel'>
        <Editor />
        <Control />
      </div>
    </main>
  );
}

export default App;
