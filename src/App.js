import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import './App.scss';
import CanvasDrawer from './components/CanvasDrawer';
import Editor from './components/Editor';
import Control from './components/Control';

function App() {
  const [drawFunctions, setDrawFunctions] = useState({});

  return (
    <main>
      <CanvasDrawer getDrawingRef={(drawingFunctions)=>setDrawFunctions(drawingFunctions)} />
      <div className='panels' id='rightPanel'>
        <Editor />
        {!isEmpty(drawFunctions) && (
          <Control drawFunctions={drawFunctions} />
        )}
      </div>
    </main>
  );
}

export default App;
