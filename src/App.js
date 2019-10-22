import React from 'react';
import AceEditor from 'react-ace';
import './App.scss';

function App() {
  return (
    <main>
      <div className='panels'>Canvas</div>
      <div className='panels' id='rightPanel'>
        <div id='textEditor'>
          <AceEditor
            mode='java'
            theme='github'
            onChange={(value) => {
              console.log('value is ', value);
            }}
            name='ACE_EDITOR'
            editorProps={{ $blockScrolling: true }}
          />
        </div>
        <div id='bottomPanel'>
          <button id='runButton'>Run</button>
          <div id='rangeDiv'>
            <div id='turtleImage'></div>
            <input id='range' type='range' name='' min='0' max='100' />
            <div id='rabbitImage'></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
