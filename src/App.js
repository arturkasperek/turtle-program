import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import './App.scss';
import CanvasDrawer from './components/CanvasDrawer';
import Editor from './components/Editor';
import Control from './components/Control';

function App() {
  const [drawFunctions, setDrawFunctions] = useState({});
  const [commands, setCommands] = useState([]);
  const [speed, setSpeed] = useState(50);
  const [runActive, setRunActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <main>
      <CanvasDrawer
        setRunActive={setRunActive}
        errorMessage={errorMessage}
        speed={speed}
        getDrawingRef={(drawingFunctions) => setDrawFunctions(drawingFunctions)}
        commands={commands}
      />

      <div className='panels' id='rightPanel'>
        <Editor setErrorMessage={setErrorMessage} setCommands={setCommands} setRunActive={setRunActive} />
        {!isEmpty(drawFunctions) && (
          <Control speed={speed} setSpeed={setSpeed} commands={commands} drawFunctions={drawFunctions} runActive={runActive} />
        )}
      </div>
    </main>
  );
}

export default App;
