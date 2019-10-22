import React from 'react';
import './App.scss';
import { spawn } from 'child_process';

function App() {
    return (
        <main>
            <div className = "panels">Canvas</div>
            <div className = "panels" id="rightPanel">
                <div id = "textEditor">Text editor</div>
                <div id = "bottomPanel">
                    <button id="runButton">Run</button>
                    <div id="rangeDiv">
                        <div id="turtleImage"></div>
                        <input id="range" type="range" name="" min="0" max="100" />
                        <div id="rabbitImage"></div>
                    </div>
                </div>
            </div>
        </main>
     );
}

export default App;
