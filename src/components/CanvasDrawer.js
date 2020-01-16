import React, { Component } from 'react';
import { render } from 'react-dom';
import './CanvasDrawer.scss';
import turtleIcon from '../img/turtle.png';

const TO_RADIANS = Math.PI / 180;

class CanvasDrawer extends Component {
  state = {
    notification: '',
  };

  constructor(props) {
    super(props);
    this.canvasRedraw = this.canvasRedraw.bind(this);
    this.downloadCanvas = this.downloadCanvas.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.backToEditor = this.backToEditor.bind(this);
  }

  isPenUp = false;

  static defaultProps = {
    getDrawingRef: () => {},
  };

  defaultInitialPos = {
    x: 100,
    y: 100,
  };

  extremePos = {
    xmin: 0,
    xmax: 0,
    ymin: 0,
    ymax: 0,
  };

  direction = {
    x: 0,
    y: 0,
  };

  canvasRef = React.createRef();
  canvasDrawerRef = React.createRef();
  virtualCanvasRef = React.createRef();

  currentPos = {
    ...this.defaultInitialPos,
  };
  turtleAngle = 0;
  oldToDraw = [];
  canvasSize = {
    x: 0,
    y: 0,
  };
  turtleImage;

  reset = (ctx) => {
    ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
    this.currentPos = {
      ...this.defaultInitialPos,
    };

    this.turtleAngle = 0;

    this.oldToDraw = [];
  };

  drawAnimate = (ctx, width, onDraw) => {
    return new Promise((resolve) => {
      const timeOfDrawing = (width / 100) * (1.01 - this.props.speed / 100) * 1000; //tutaj sobie ustawie prędkość
      let start = null;
      let pos;
      const animate = (time) => {
        ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
        this.oldToDraw.forEach((func) => func());
        if (!start) {
          start = time;
        }
        const timeProgress = time - start;
        const progress = timeProgress / timeOfDrawing;
        pos = onDraw(progress > 1 ? 1 : progress, this.isPenUp, false);

        if (pos.x > this.extremePos.xmax) {
          this.extremePos.xmax = pos.x;
        }
        if (pos.x < this.extremePos.xmin) {
          this.extremePos.xmin = pos.x;
        }
        if (pos.y > this.extremePos.ymax) {
          this.extremePos.ymax = pos.y;
        }
        if (pos.y < this.extremePos.ymin) {
          this.extremePos.ymin = pos.y;
        }

        if (timeProgress < timeOfDrawing) {
          window.requestAnimationFrame(animate);
        } else {
          const ipu = this.isPenUp;
          this.oldToDraw.push(() => onDraw(1, ipu, true));
          this.currentPos = pos;
          resolve();
        }
      };
      window.requestAnimationFrame(animate);
    });
  };

  drawLineAnimate = (ctx, width) => {
    const drawFunc = (widthP, angleP, currentPos) => {
      return (progress, isPenUp, redraw) => this.drawLine(ctx, widthP * progress, angleP, currentPos, isPenUp, redraw);
    };
    return this.drawAnimate(ctx, width, drawFunc(width, this.turtleAngle, { ...this.currentPos }));
  };

  drawArcAnimate = (ctx, percentageToDraw, r) => {
    const l = 2 * Math.PI * r;
    const drawFunc = (percentageToDrawP, rP, currentPos) => {
      return (progress, isPenUp, redraw) => this.drawArc(ctx, percentageToDrawP * progress, rP, currentPos, isPenUp, redraw);
    };

    return this.drawAnimate(ctx, (l * percentageToDraw) / 100, drawFunc(percentageToDraw, r, this.currentPos));
  };

  loadTurtleIcon = () => {
    this.turtleImage = new Image();
    this.turtleImage.src = turtleIcon;
  };

  async componentDidMount() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const adjustCanvasSize = this.adjustCanvasSizeFactory(ctx);

    if (window.matchMedia('(max-width: 900px)').matches) {
      this.props.setDisplay({ drawer: 'none', rightPanel: 'grid' });
    }

    window.addEventListener('resize', adjustCanvasSize);
    this.canvasDrawerRef.current.addEventListener('mousedown', this.mouseDown, false);
    this.canvasDrawerRef.current.addEventListener('mouseup', this.mouseUp, false);
    adjustCanvasSize();
    this.loadTurtleIcon();
    this.props.getDrawingRef({
      drawLine: (...props) => this.drawLineAnimate(ctx, ...props),
      drawArc: (...props) => this.drawArcAnimate(ctx, ...props),
      rotate: (...props) => this.rotate(...props),
      penUp: () => this.penUp(),
      penDown: () => this.penDown(),
      reset: () => this.reset(ctx),
      finish: () => this.finish(),
      sketching: () => this.sketching(),
    });
  }

  mouseDown() {
    this.canvasDrawerRef.current.addEventListener('mousemove', this.mouseMove, true);
  }
  mouseMove(e) {
    this.direction = { x: this.direction.x + e.movementX, y: this.direction.y + e.movementY };
    this.moveCanvas();
  }
  mouseUp() {
    this.canvasDrawerRef.current.removeEventListener('mousemove', this.mouseMove, true);
  }

  adjustCanvasSizeFactory = (ctx) => {
    return () => {
      const sizeX = this.canvasDrawerRef.current.offsetWidth;
      const sizeY = this.canvasDrawerRef.current.offsetHeight;

      this.canvasRef.current.width = sizeX;
      this.canvasRef.current.height = sizeY;

      this.canvasSize = {
        x: sizeX,
        y: sizeY,
      };

      ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
      this.oldToDraw.forEach((func) => func());
    };
  };

  drawTurtle(ctx, pos, angle = 0) {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle * TO_RADIANS);
    ctx.drawImage(this.turtleImage, -(this.turtleImage.width / 2), -(this.turtleImage.height / 2));
    ctx.restore();
  }

  drawArc(ctx, percentageToDraw, r, currentPos, isPenUp, redraw) {
    const x1 = currentPos.x;
    const y1 = currentPos.y;
    const toDraw = percentageToDraw / 100;
    const c1 = x1 + r;
    const c2 = y1;
    const angle = (1 + 2 * toDraw) * Math.PI;
    const x2 = c1 + Math.cos(angle) * r;
    const y2 = c2 + Math.sin(angle) * r;
    const newPos = {
      x: x2,
      y: y2,
    };

    ctx.beginPath();
    ctx.lineWidth = isPenUp ? 0.001 : 2;
    ctx.arc(c1, c2, r, Math.PI, angle);
    ctx.stroke();

    if (!redraw) {
      this.drawTurtle(ctx, newPos);
    }

    return newPos;
  }

  drawLine(ctx, width, turtleAngle, currentPos, isPenUp, redraw) {
    const x1 = currentPos.x;
    const y1 = currentPos.y;
    const r = width;
    const theta = Math.PI * turtleAngle;
    const x2 = x1 + r * Math.cos(theta);
    const y2 = y1 + r * Math.sin(theta);
    const newPos = {
      x: x2,
      y: y2,
    };
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.lineWidth = isPenUp ? 0.001 : 2; //tu działa ispenup
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (!redraw) {
      this.drawTurtle(ctx, newPos, turtleAngle * 180);
    }

    return newPos;
  }
  penUp() {
    this.isPenUp = true;
  }
  penDown() {
    this.isPenUp = false;
  }

  rotate(angle) {
    this.turtleAngle += angle / 180;
  }

  //Funkcja informująca, że rysunek jest w trakcie wykonywania
  sketching() {
    this.extremePos = {
      xmin: 0,
      xmax: 0,
      ymin: 0,
      ymax: 0,
    };
    this.direction = {
      x: 0,
      y: 0,
    };

    this.props.setRunActive(false);
    this.setState({
      notification: 'Sketching...',
    });
  }

  //Funkcja informująca, że rysowanie zostało zakończone
  finish() {
    this.props.setRunActive(true);
    this.setState({
      notification: 'Sketch is done!!!',
    });
  }

  //Funkcja tworząca png z canvasa
  downloadCanvas() {
    this.virtualCanvasRef.current.width = this.extremePos.xmax - this.extremePos.xmin + this.defaultInitialPos.x;
    this.virtualCanvasRef.current.height = this.extremePos.ymax - this.extremePos.ymin + this.defaultInitialPos.y;
    this.canvasRedraw(this.virtualCanvasRef.current.getContext('2d'), {
      x: this.extremePos.xmin > 0 ? 0 : 1.5 * this.defaultInitialPos.x - this.extremePos.xmin,
      y: this.extremePos.ymin > 0 ? 0 : 1.5 * this.defaultInitialPos.y - this.extremePos.ymin,
    });
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = this.virtualCanvasRef.current.toDataURL();
    a.download = 'MyDraw.png';
    a.click();
    document.body.removeChild(a);
  }

  //Funkcja do przerysowywania canvasa
  canvasRedraw(ctx, position) {
    let rote = 0;
    for (let i = 0; i < this.props.commands.length; i++) {
      const command = this.props.commands[i];
      switch (command.name) {
        case 'drawLine':
          position = this.drawLine(ctx, ...command.args, rote, position, this.isPenUp, true);
          break;
        case 'drawArc':
          position = this.drawArc(ctx, ...command.args, position, this.isPenUp, true);
          break;
        case 'rotate':
          rote += command.args[0] / 180;
          break;
        case 'penUp':
          this.penUp();
          break;
        case 'penDown':
          this.penDown();
          break;
      }
    }
    return position;
  }

  //Funkcja do przesuwania canvasa
  moveCanvas() {
    this.reset(this.canvasRef.current.getContext('2d'));
    this.currentPos = this.canvasRedraw(this.canvasRef.current.getContext('2d'), {
      x: this.defaultInitialPos.x + this.direction.x,
      y: this.defaultInitialPos.y + this.direction.y,
    });
  }

  backToEditor() {
    this.props.setDisplay({ drawer: 'none', rightPanel: 'grid' });
  }

  render() {
    return (
      <div id='drawer-container' style={{ display: this.props.display.drawer }}>
        <div className={'canvas-drawer'} ref={this.canvasDrawerRef}>
          <canvas width={'200px'} height={'640px'} ref={this.canvasRef} />
          <canvas style={{ display: 'none' }} ref={this.virtualCanvasRef} />
        </div>
        <div id='navi'>
          <button
            id='up-button'
            onClick={() => {
              this.direction.y += -10;
              this.moveCanvas();
            }}
          >
            Up
          </button>
          <button
            id='down-button'
            onClick={() => {
              this.direction.y += 10;
              this.moveCanvas();
            }}
          >
            Down
          </button>
          <button
            id='left-button'
            onClick={() => {
              this.direction.x += -10;
              this.moveCanvas();
            }}
          >
            Left
          </button>
          <button
            id='right-button'
            onClick={() => {
              this.direction.x += 10;
              this.moveCanvas();
            }}
          >
            Right
          </button>
          <button id='plus-button'>+</button>
          <button id='minus-button'>-</button>
          <button id='download-button' onClick={this.downloadCanvas}>
            Convert
          </button>
          <button id='back-button' onClick={this.backToEditor}>
            Back
          </button>
        </div>
        {!!this.props.errorMessage && <div className='notification error' dangerouslySetInnerHTML={{ __html: this.props.errorMessage }} />}
        {!this.props.errorMessage && <div className='notification'>{this.state.notification}</div>}
      </div>
    );
  }
}

export default CanvasDrawer;
