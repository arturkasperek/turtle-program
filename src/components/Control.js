import React from 'react';
import '../App.scss';
import './Control.scss';
import slowIcon from '../img/snail.png';
import fastIcon from '../img/rabbit.png';

class Control extends React.Component {
  runDrawing = async () => {
    const { drawLine, drawArc, rotate } = this.props.drawFunctions;
    await drawLine(100);
    await rotate(50);
    await drawLine(50);
    await rotate(90);
    await drawLine(50);
    await rotate(80);
    await drawArc(20, 100);
    await drawArc(20, 20);
    await rotate(40);
    await drawLine(50);
    await rotate(90);
    await drawLine(100);
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
