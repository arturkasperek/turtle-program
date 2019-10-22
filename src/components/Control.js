import React from 'react';
import '../App.scss';

class Control extends React.Component {
    render() {
        return (
            <div id="bottomPanel">
                <button id="runButton">Run</button>
                <div id="rangeDiv">
                    <div id="turtleImage"></div>
                    <input id="range" type="range" name="" min="0" max="100" />
                    <div id="rabbitImage"></div>
                </div>
            </div>
        );
    }

}

export default Control;