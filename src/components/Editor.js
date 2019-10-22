import React from 'react';
import AceEditor from 'react-ace';
import '../App.scss';

class Editor extends React.Component {
  render() {
    return (
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
    );
  }
}

export default Editor;
