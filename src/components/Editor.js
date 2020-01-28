import React from 'react';
import { debounce, get } from 'lodash';
import AceEditor from 'react-ace';
import * as esprima from 'esprima';
import '../App.scss';
import './Editor.scss';

const AllowedFunNames = ['drawLine', 'drawArc', 'rotate', 'penUp', 'penDown', 'repeat'];

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.repeater = this.repeater.bind(this);
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
      const funcNotAllowedNames = [];

      parsed.body.forEach((i) => {
        if (i.type === 'ExpressionStatement' && i.expression.type === 'CallExpression') {
          const funName = i.expression.callee.name;

          if (AllowedFunNames.indexOf(funName) === -1) {
            funcNotAllowedNames.push(`Funkcja '${funName}' nie jest dozwolona!`);
          }

          // Wykrycie pętli
          if (funName === 'repeat') {
            // ilość powtórzeń // tablica z expression Statement // pusta tablica
            commands = commands.concat(this.repeater(i.expression.arguments[0].value, i.expression.arguments[1].body.body, []));
          } else {
            commands.push({
              name: funName,
              args: get(i.expression, 'arguments', []).map((i) => i.value),
            });
          }
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

  // Funkcja do obsługi pętli repeat
  repeater(count, args, commandsInside) {
    for (let j = 0; j < count; j++) {
      args.forEach((k) => {
        if (k.expression.callee.name !== 'repeat') {
          commandsInside.push({
            name: k.expression.callee.name,
            args: get(k.expression, 'arguments', []).map((k) => k.value),
          });
        } else {
          commandsInside = this.repeater(k.expression.arguments[0].value, k.expression.arguments[1].body.body, commandsInside);
        }
      });
    }
    return commandsInside;
  }

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
          value='//Simple tutorial
//Lets play...
//You can draw a line using drawLine(length here)
drawLine(100)
//You can pen up using penUp()
penUp()
//Now we arent see results of comands below
//Its not visable
drawLine(100)
//To pen down you have to use penDown()
penDown()
//Its visible 
drawLine(100)
//We can change direction for drawing using rotate(here angle)
rotate(90)
//What has happened? Lets draw a line and see...
drawLine(100)
//We can draw arcs using drawArc(here % of circle, here r of circle)
drawArc(50,20)
//We can also make loops using repeat(here loop count, ()=>{here comands...})
repeat(4, ()=>{
    drawLine(30)
    rotate(45)
})
//Gratulations!!! You know now, how to drawing. Soo, enjoy and have fun :D
//To watch result fo this tutorial, you have to add new line here and click run button'
          onChange={this.validateCodeDebounce}
          name='ACE_EDITOR'
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    );
  }
}

export default Editor;
