import React from 'react';
import '../App.scss';
import slowIcon from '../img/snail.png';
import fastIcon from '../img/rabbit.png';

class Control extends React.Component {
  render() {
    return (
      <div id='bottomPanel'>
        <button id='runButton'>Run</button>
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
