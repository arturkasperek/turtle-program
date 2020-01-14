import React, { Component } from 'react';
import { render } from 'react-dom';
import './CanvasDrawer.scss';

class CanvasDrawer extends Component {
  constructor(props) {
    super(props);
    this.canvasRedraw = this.canvasRedraw.bind(this);
    this.downloadCanvas = this.downloadCanvas.bind(this);
  }
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

  canvasRef = React.createRef();
  canvasDrawerRef = React.createRef();
  virtualCanvasRef = React.createRef();

  currentPos = {
    ...this.defaultInitialPos,
  };
  turtleAngle = 0;
  speed = 1;
  oldToDraw = [];
  canvasSize = {
    x: 0,
    y: 0,
  };

  reset = (ctx) => {
    ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
    this.currentPos = {
      ...this.defaultInitialPos,
    };
    this.extremePos = {
      xmin: 0,
      xmax: 0,
      ymin: 0,
      ymax: 0,
    };
    this.turtleAngle = 0;

    this.oldToDraw = [];
  };

  drawAnimate = (ctx, width, onDraw) => {
    return new Promise((resolve) => {
      const timeOfDrawing = (width / 100) * this.speed * 1000;
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
        pos = onDraw(progress > 1 ? 1 : progress);

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
          this.oldToDraw.push(() => onDraw(1));
          this.currentPos = pos;
          resolve();
        }
      };
      window.requestAnimationFrame(animate);
    });
  };

  drawLineAnimate = (ctx, width) => {
    const drawFunc = (widthP, angleP, currentPos) => {
      return (progress) => this.drawLine(ctx, widthP * progress, angleP, currentPos);
    };
    return this.drawAnimate(ctx, width, drawFunc(width, this.turtleAngle, { ...this.currentPos }));
  };

  drawArcAnimate = (ctx, percentageToDraw, r) => {
    const l = 2 * Math.PI * r;
    const drawFunc = (percentageToDrawP, rP, currentPos) => {
      return (progress) => this.drawArc(ctx, percentageToDrawP * progress, rP, currentPos);
    };

    return this.drawAnimate(ctx, (l * percentageToDraw) / 100, drawFunc(percentageToDraw, r, this.currentPos));
  };

  async componentDidMount() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const adjustCanvasSize = this.adjustCanvasSizeFactory(ctx);

    window.addEventListener('resize', adjustCanvasSize);
    adjustCanvasSize();
    this.props.getDrawingRef({
      drawLine: (...props) => this.drawLineAnimate(ctx, ...props),
      drawArc: (...props) => this.drawArcAnimate(ctx, ...props),
      rotate: (...props) => this.rotate(...props),
      reset: () => this.reset(ctx),
    });
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

  drawArc(ctx, percentageToDraw, r, currentPos) {
    const x1 = currentPos.x;
    const y1 = currentPos.y;
    const toDraw = percentageToDraw / 100;
    const c1 = x1 + r;
    const c2 = y1;
    const angle = (1 + 2 * toDraw) * Math.PI;
    const x2 = c1 + Math.cos(angle) * r;
    const y2 = c2 + Math.sin(angle) * r;

    ctx.beginPath();
    ctx.arc(c1, c2, r, Math.PI, angle);
    ctx.stroke();

    return {
      x: x2,
      y: y2,
    };
  }

  drawLine(ctx, width, turtleAngle, currentPos) {
    const x1 = currentPos.x;
    const y1 = currentPos.y;
    const r = width;
    const theta = Math.PI * turtleAngle;
    const x2 = x1 + r * Math.cos(theta);
    const y2 = y1 + r * Math.sin(theta);
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    return {
      x: x2,
      y: y2,
    };
  }

  rotate(angle) {
    this.turtleAngle += angle / 180;
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
          position = this.drawLine(ctx, ...command.args, rote, position);
          break;
        case 'drawArc':
          position = this.drawArc(ctx, ...command.args, position);
          break;
        case 'rotate':
          rote += command.args[0] / 180;
          break;
      }
    }
  }

  render() {
    return (
      <div className={'canvas-drawer'} ref={this.canvasDrawerRef}>
        <canvas id='cvs' width={'200px'} height={'640px'} ref={this.canvasRef} />
        <canvas style={{ display: 'none' }} ref={this.virtualCanvasRef} />
      </div>
    );
  }
}

export default CanvasDrawer;
