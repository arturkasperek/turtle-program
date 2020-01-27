import React, { Component } from 'react';
import { render } from 'react-dom';
import './CanvasDrawer.scss';
import turtleIcon from '../img/turtle.png';
import CanvasSVG from '../canvas-getsvg';

const TO_RADIANS = Math.PI / 180;

class CanvasDrawer extends Component {
  state = {
    notification: '',
    convertType: 'svg',
  };

  constructor(props) {
    super(props);
    this.canvasRedraw = this.canvasRedraw.bind(this);
    this.downloadCanvas = this.downloadCanvas.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.backToEditor = this.backToEditor.bind(this);
    this.scaleUp = this.scaleUp.bind(this);
    this.scaleDown = this.scaleDown.bind(this);
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.changeConvertType = this.changeConvertType.bind(this);
  }

  isPenUp = false;

  isSketching = false;

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
  lastDirection = {
    x: 0,
    y: 0,
  };

  scale = 1;

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

    if (window.matchMedia('(max-width: 600px)').matches) {
      this.props.setDisplay({ drawer: 'none', rightPanel: 'grid' });
    }

    window.addEventListener('resize', adjustCanvasSize);
    this.canvasDrawerRef.current.addEventListener('mousedown', this.mouseDown, false);
    this.canvasDrawerRef.current.addEventListener('mouseup', this.mouseUp, false);
    this.canvasDrawerRef.current.addEventListener('touchstart', this.touchStart, true);
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
      adjustCanvasSize: () => adjustCanvasSize(),
    });
  }

  touchStart(e) {
    if (!this.isSketching) {
      let touchPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      this.canvasDrawerRef.current.addEventListener(
        'touchmove',
        (e) => {
          this.touchMove(e, touchPos);
        },
        true
      );
      this.canvasDrawerRef.current.addEventListener('touchend', this.touchEnd, false);
    }
  }

  touchMove(e, touchedPos) {
    let change = {
      x: -touchedPos.x + e.touches[0].clientX,
      y: -touchedPos.y + e.touches[0].clientY,
    };
    this.direction.x = this.lastDirection.x + change.x;
    this.direction.y = this.lastDirection.y + change.y;
    this.moveCanvas();
  }

  touchEnd() {
    const x = this.direction.x;
    const y = this.direction.y;
    this.lastDirection = {
      x: x,
      y: y,
    };
  }

  mouseDown() {
    if (!this.isSketching) {
      this.canvasDrawerRef.current.addEventListener('mousemove', this.mouseMove, true);
    }
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
      this.moveCanvas();
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
    r = r * this.scale;
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
    const x2 = x1 + r * Math.cos(theta) * this.scale;
    const y2 = y1 + r * Math.sin(theta) * this.scale;
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
    this.lastDirection = {
      x: 0,
      y: 0,
    };
    this.scale = 1;

    this.props.setRunActive(false);
    this.setState({
      notification: 'Sketching...',
    });
    this.isSketching = true;
  }

  //Funkcja informująca, że rysowanie zostało zakończone
  finish() {
    this.props.setRunActive(true);
    this.setState({
      notification: 'Sketch is done!!!',
    });
    this.isSketching = false;
  }

  //Funkcja tworząca png z canvasa
  downloadCanvas() {
if (!this.isSketching) {
    if (this.state.convertType == 'svg') {
      this.virtualCanvasRef.current.width = (this.extremePos.xmax - this.extremePos.xmin + this.defaultInitialPos.x) * this.scale;
      this.virtualCanvasRef.current.height = (this.extremePos.ymax - this.extremePos.ymin + this.defaultInitialPos.y) * this.scale;
      const canvas = this.virtualCanvasRef.current;
      const canvasSVGcontext = new CanvasSVG.Deferred();
      canvasSVGcontext.wrapCanvas(canvas);
      var ctx = canvas.getContext('2d');
      this.canvasRedraw(ctx, {
        x: this.extremePos.xmin > 0 ? 0 : (1.5 * this.defaultInitialPos.x - this.extremePos.xmin) * this.scale,
        y: this.extremePos.ymin > 0 ? 0 : (1.5 * this.defaultInitialPos.y - this.extremePos.ymin) * this.scale,
      });
      const a = document.createElement('a');
      a.appendChild(ctx.getSVG());
      document.body.appendChild(a);
      var serializer = new XMLSerializer();
      var source = serializer.serializeToString(a);

      //Deklaracja xmla
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

      //Conversja svg do schematu url
      a.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
      a.download = 'MyDraw.' + this.state.convertType;
      a.click();
      document.body.removeChild(a);
    } else {
    
      this.virtualCanvasRef.current.width = (this.extremePos.xmax - this.extremePos.xmin + this.defaultInitialPos.x) * this.scale;
      this.virtualCanvasRef.current.height = (this.extremePos.ymax - this.extremePos.ymin + this.defaultInitialPos.y) * this.scale;
      this.canvasRedraw(this.virtualCanvasRef.current.getContext('2d'), {
        x: this.extremePos.xmin > 0 ? 0 : (1.5 * this.defaultInitialPos.x - this.extremePos.xmin) * this.scale,
        y: this.extremePos.ymin > 0 ? 0 : (1.5 * this.defaultInitialPos.y - this.extremePos.ymin) * this.scale,
      });
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = this.virtualCanvasRef.current.toDataURL();
      a.download = 'MyDraw.' + this.state.convertType;
      a.click();
      document.body.removeChild(a);
    }
  }
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

  scaleUp() {
    if (!this.isSketching) {
      if (this.scale >= 1) {
        this.scale += 1;
      } else {
        this.scale += 0.1;
      }
      this.moveCanvas();
    }
  }

  scaleDown() {
    if (!this.isSketching) {
      if (this.scale > 1) {
        this.scale -= 1;
      } else if (this.scale > 0.2) {
        this.scale -= 0.1;
      }
      this.moveCanvas();
    }
  }

  changeConvertType() {
    switch (this.state.convertType) {
      case 'png':
        {
          this.setState({ convertType: 'jpg' });
        }
        break;
      case 'jpg':
        {
          this.setState({ convertType: 'png' });
        }
        break;
    }
  }

  render() {
    return (
      <div id='drawer-container' style={{ display: this.props.display.drawer }}>
        <div className={'canvas-drawer'} ref={this.canvasDrawerRef}>
          <canvas ref={this.canvasRef} />
          <canvas style={{ display: 'none' }} ref={this.virtualCanvasRef} />
        </div>
        <div id='navi'>
          <button
            id='up-button'
            onClick={() => {
              if (!this.isSketching) {
                this.direction.y += -10;
                this.moveCanvas();
              }
            }}
          >
            Up
          </button>
          <button
            id='down-button'
            onClick={() => {
              if (!this.isSketching) {
                this.direction.y += 10;
                this.moveCanvas();
              }
            }}
          >
            Down
          </button>
          <button
            id='left-button'
            onClick={() => {
              if (!this.isSketching) {
                this.direction.x += -10;
                this.moveCanvas();
              }
            }}
          >
            Left
          </button>
          <button
            id='right-button'
            onClick={() => {
              if (!this.isSketching) {
                this.direction.x += 10;
                this.moveCanvas();
              }
            }}
          >
            Right
          </button>
          <button id='plus-button' onClick={this.scaleUp}>
            +
          </button>
          <button id='minus-button' onClick={this.scaleDown}>
            -
          </button>
          <button id='download-button' onClick={this.downloadCanvas}>
            Convert
          </button>
          <button id='back-button' onClick={this.backToEditor}>
            Back
          </button>
          <button id='convert-type-button' onClick={this.changeConvertType}>
            Type: {this.state.convertType}
          </button>
        </div>
        {!!this.props.errorMessage && <div className='notification error' dangerouslySetInnerHTML={{ __html: this.props.errorMessage }} />}
        {!this.props.errorMessage && <div className='notification'>{this.state.notification}</div>}
      </div>
    );
  }
}

export default CanvasDrawer;
