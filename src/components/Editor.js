import React from 'react';
import { debounce, get } from 'lodash';
import AceEditor from 'react-ace';
import * as esprima from 'esprima';
import '../App.scss';
import './Editor.scss';

const AllowedFunNames = ['drawLine', 'drawArc', 'rotate', 'penUp', 'penDown', 'repeat', 'end'];

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
  }
  editorRef = React.createRef();

  componentDidMount() {
    this.editorRef.current.addEventListener('touchstart', this.touchStart, true);
  }

  touchPos;
  touchedPos;

  touchStart(e) {
    this.touchPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    this.editorRef.current.addEventListener('touchmove', this.touchMove, true);
    this.editorRef.current.addEventListener('touchend', this.touchEnd, false);
  }

  touchMove(e) {
    this.touchedPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  touchEnd() {
    if (this.touchedPos.x - this.touchPos.x > 100) {
      this.props.setDisplay({ drawer: 'grid', rightPanel: 'none' });
    }
    this.touchPos = {
      x: 0,
      y: 0,
    };
    this.touchedPos = {
      x: 0,
      y: 0,
    };
  }

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
      const funcNotAllowedNames = [];

      parsed.body.forEach((i) => {
        if (i.type === 'ExpressionStatement' && i.expression.type === 'CallExpression') {
          const funName = i.expression.callee.name;

          if (AllowedFunNames.indexOf(funName) === -1) {
            funcNotAllowedNames.push(`Funkcja '${funName}' nie jest dozwolona!`);
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

      if (shouldRepeat) {
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
      }

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
      <div id='textEditor' ref={this.editorRef}>
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
