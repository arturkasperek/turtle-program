import React, { Component } from 'react';
import { render } from 'react-dom';
import './CanvasDrawer.scss';

class CanvasDrawer extends Component {
  isPenUp = false;
  static defaultProps = {
    getDrawingRef: () => {},
  };

  defaultInitialPos = {
    x: 100,
    y: 100,
  };
  canvasRef = React.createRef();
  canvasDrawerRef = React.createRef();
  currentPos = {
    ...this.defaultInitialPos,
  };
  turtleAngle = 0;
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
        pos = onDraw(progress > 1 ? 1 : progress, this.isPenUp);

        if (timeProgress < timeOfDrawing) {
          window.requestAnimationFrame(animate);
        } else {
          const ipu = this.isPenUp;
          this.oldToDraw.push(() => onDraw(1, ipu));
          this.currentPos = pos;
          resolve();
        }
      };
      window.requestAnimationFrame(animate);
    });
  };

  drawLineAnimate = (ctx, width) => {
    const drawFunc = (widthP, angleP, currentPos) => {
      return (progress, isPenUp) => this.drawLine(ctx, widthP * progress, angleP, currentPos, isPenUp);
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
      penUp: () => this.penUp(),
      penDown: () => this.penDown(),
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

  drawLine(ctx, width, turtleAngle, currentPos, isPenUp) {
    const x1 = currentPos.x;
    const y1 = currentPos.y;
    const r = width;
    const theta = Math.PI * turtleAngle;
    const x2 = x1 + r * Math.cos(theta);
    const y2 = y1 + r * Math.sin(theta);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.lineWidth = isPenUp ? 0.001 : 2; //tu działa ispenup
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return {
      x: x2,
      y: y2,
    };
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

  render() {
    return (
      <div className={'canvas-drawer'} ref={this.canvasDrawerRef}>
        <canvas width={'395px'} height={'646px'} ref={this.canvasRef} />
      </div>
    );
  }
}

export default CanvasDrawer;
