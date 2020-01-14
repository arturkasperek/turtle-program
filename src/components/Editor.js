import React from 'react';
import { debounce, get } from 'lodash';
import AceEditor from 'react-ace';
import * as esprima from 'esprima';
import '../App.scss';
import './Editor.scss';

const AllowedFunNames = ['drawLine', 'drawArc', 'rotate', 'penUp', 'penDown'];

class Editor extends React.Component {
  validateCode = (code) => {
    let commands = [];
    try {
      const parsed = esprima.parseScript(code);

      parsed.body.forEach((i) => {
        if (i.type === 'ExpressionStatement' && i.expression.type === 'CallExpression') {
          const funName = i.expression.callee.name;

          if (AllowedFunNames.indexOf(funName) === -1) {
            throw new Error('Not allowed func');
          }
          commands.push({
            name: funName,
            args: get(i.expression, 'arguments', []).map((i) => i.value),
          });
        }
      });

      this.props.setCommands(commands);
    } catch (e) {
      console.log('Parse err is ', e);
    }
  };

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return false;
  }

  validateCodeDebounce = debounce(this.validateCode, 1000);

  render() {
    return (
      <div id='textEditor'>
        <AceEditor
          mode='java'
          theme='github'
          onChange={this.validateCodeDebounce}
          name='ACE_EDITOR'
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    );
  }
}

export default Editor;
