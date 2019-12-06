import React from 'react';
import '../App.scss';
import './Control.scss';
import slowIcon from '../img/snail.png';
import fastIcon from '../img/rabbit.png';

class Control extends React.Component {
  runDrawing = async () => {
    const { drawLine, drawArc, rotate, reset, downloadCanvas } = this.props.drawFunctions;

    reset();
    for (let i = 0; i < this.props.commands.length; i++) {
      const command = this.props.commands[i];
      switch (command.name) {
        case 'drawLine':
          await drawLine(...command.args);
          break;
        case 'drawArc':
          await drawArc(...command.args);
          break;
        case 'rotate':
          await rotate(...command.args);
          break;
      }
    }
      downloadCanvas();
  };

  render() {
    return (
      <div id='bottomPanel'>
        <button onClick={this.runDrawing} id='runButton'>
          Run
        </button>
        <div id='rangeDiv'>
          <div id='turtleImage'>
            <img src={slowIcon} width='32' height='32' />
          </div>
          <input id='range' type='range' name='' min='0' max='100' />
          <div id='rabbitImage'>
            <img src={fastIcon} width='25' height='25' />
          </div>
        </div>
      </div>
    );
  }
}

export default Control;
