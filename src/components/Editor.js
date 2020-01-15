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
      const funcNotAllowedNames = [];

      parsed.body.forEach((i) => {
        if (i.type === 'ExpressionStatement' && i.expression.type === 'CallExpression') {
          const funName = i.expression.callee.name;

          if (AllowedFunNames.indexOf(funName) === -1) {
            funcNotAllowedNames.push(`Funkcja '${funName}' nie jest dozwolona!`);
          }

          commands.push({
            name: funName,
            args: get(i.expression, 'arguments', []).map((i) => i.value),
          });
        }
      });

      if (funcNotAllowedNames.length > 0) {
        throw new Error(funcNotAllowedNames.join('</br>'));
      }
      this.props.setCommands(commands);
      this.props.setRunActive(true);
      this.props.setErrorMessage('');
    } catch (e) {
      this.props.setRunActive(false);
      this.props.setErrorMessage(e.message);
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
