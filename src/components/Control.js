import React from 'react';
import '../App.scss';
import './Control.scss';
import slowIcon from '../img/snail.png';
import fastIcon from '../img/rabbit.png';

class Control extends React.Component {
  runDrawing = async () => {
    const { drawLine, drawArc, rotate, reset, penUp, penDown, finish, sketching } = this.props.drawFunctions;

    reset();
    sketching();
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
        case 'penUp':
          await penUp();
          break;
        case 'penDown':
          await penDown();
          break;
      }
    }
    finish();
  };

  onRangeChange = (e) => {
    this.props.setSpeed(e.target.value);
  };

  render() {
    return (
      <div id='bottomPanel'>
        <button onClick={this.runDrawing} id='runButton' disabled={!this.props.runActive}>
          Run
        </button>
        <div id='rangeDiv'>
          <div id='turtleImage'>
            <img src={slowIcon} width='32' height='32' />
          </div>
          <input value={this.props.speed} onChange={this.onRangeChange} id='range' type='range' name='' min='0' max='100' />
          <div id='rabbitImage'>
            <img src={fastIcon} width='25' height='25' />
          </div>
        </div>
      </div>
    );
  }
}

export default Control;
