import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import './App.scss';
import CanvasDrawer from './components/CanvasDrawer';
import Editor from './components/Editor';
import Control from './components/Control';

function App() {
  const [drawFunctions, setDrawFunctions] = useState({});
  const [commands, setCommands] = useState([]);

  return (
    <main>
      <CanvasDrawer getDrawingRef={(drawingFunctions) => setDrawFunctions(drawingFunctions)} commands={commands} />
      <div className='panels' id='rightPanel'>
        <Editor setCommands={setCommands} />
        {!isEmpty(drawFunctions) && <Control commands={commands} drawFunctions={drawFunctions} />}
      </div>
    </main>
  );
}

export default App;
