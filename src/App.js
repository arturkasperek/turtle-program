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
  const [display, setDisplay] = useState({ drawer: 'grid', rightPanel: 'grid' });
  const [runActive, setRunActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <main>
      <meta name='viewport' content='width=device-width, initial-scale=1' />

      <CanvasDrawer
        speed={speed}
        getDrawingRef={(drawingFunctions) => setDrawFunctions(drawingFunctions)}
        commands={commands}
        setRunActive={setRunActive}
        errorMessage={errorMessage}
        display={display}
        setDisplay={setDisplay}
      />

      <div className='panels' id='rightPanel' style={{ display: display.rightPanel }}>
        <Editor setErrorMessage={setErrorMessage} setCommands={setCommands} setRunActive={setRunActive} />
        {!isEmpty(drawFunctions) && (
          <Control
            speed={speed}
            setSpeed={setSpeed}
            commands={commands}
            drawFunctions={drawFunctions}
            runActive={runActive}
            display={display}
            setDisplay={setDisplay}
          />
        )}
      </div>
    </main>
  );
}

export default App;
