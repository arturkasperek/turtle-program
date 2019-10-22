import React from 'react';
import '../App.scss';

class Canvas extends React.Component {

    componentDidMount() {
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
    }

    render() {
        return (
            <div className="panels">
                <canvas id="myCanvas"/>
            </div>
            );
    }

}

export default Canvas;