import React from 'react';
import AceEditor from 'react-ace';
import '../App.scss';
import './Editor.scss';
import './Control.js';
import parse from './Parser.js';

class Editor extends React.Component {
  render() {
    return (
      <div id='textEditor'>
        <AceEditor
          mode='java'
          theme='github'
          onChange={(value) => {
            var button = document.getElementById("runButton");
            button.onclick = function(){
              parse(value);
            }
          }}
          name='ACE_EDITOR'
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    );
  }
}

export default Editor;
