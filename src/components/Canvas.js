import React from 'react';
import '../App.scss';
import './Canvas.scss';

class Canvas extends React.Component {
  canvasRef = React.createRef();

  componentDidMount() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    console.log('ctx is ', ctx);
  }

  render() {
    return (
      <div className='panels'>
        <canvas ref={this.canvasRef} />
      </div>
    );
  }
}

export default Canvas;
