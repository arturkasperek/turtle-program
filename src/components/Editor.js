import React from 'react';
import { debounce, get } from 'lodash';
import AceEditor from 'react-ace';
import * as esprima from 'esprima';
import '../App.scss';
import './Editor.scss';

const AllowedFunNames = ['drawLine', 'drawArc', 'rotate', 'repeat', 'end'];

class Editor extends React.Component {
  validateCode = (code) => {
    let commands = [];
    try {
      const parsed = esprima.parseScript(code);
      // Zmienna pomocnicza informująca czy dane komendy powtarzać
      var shouldRepeat = false;
      // W tej tablicy przechowywane są obiekty "parsed.body"
      var funNames = [];
      // Zmienna pomocnicza potrzebna do zakodowania ilości powtórzeń pętli
      var loops = 0;

      parsed.body.forEach((i) => {
        if (i.type === 'ExpressionStatement' && i.expression.type === 'CallExpression') {
          const funName = i.expression.callee.name;

          if (AllowedFunNames.indexOf(funName) === -1) {
            throw new Error('Not allowed func');
          }

          // Wykrycie pętli
          if (funName === 'repeat') {
            loops = i.expression.arguments[0].value;
            shouldRepeat = true;
          }

          // Zapisywanie a następnie wykonanie komend po wykryciu end
          if (shouldRepeat) {
            if (funName === 'end') {
              shouldRepeat = false;
              for (var j = 0; j < loops; j++) {
                funNames.forEach((k) => {
                  if (k.expression.callee.name !== 'repeat' && k.expression.callee.name !== 'end')
                    commands.push({
                      name: k.expression.callee.name,
                      args: get(k.expression, 'arguments', []).map((k) => k.value),
                    });
                });
              }
              funNames = [];
              loops = 0;
            } else {
              funNames.push(i);
            }
          }

          // Odrzucenie komend repeat i end pownieważ nie odpowiadają one za rysowanie
          if (funName !== 'repeat' && funName !== 'end')
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
