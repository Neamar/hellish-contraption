import { STATE_PLAYING, context, state } from './game.js';
import { renderHud } from './hud.js';

const FRAME_DURATION = 2000;


/**
 *
 * @param {CSSNumberish} time
 */
const renderFrame = (time) => {
  context.clearRect(0, 0, 1024, 780);
  let frameType = 'paused';
  let frameTypePercentage = 0;
  if (state.state === STATE_PLAYING) {
    let frameLength = Number(time) - Number(state.frameStartedAt);
    if (frameLength > FRAME_DURATION) {
      frameLength %= FRAME_DURATION;
      state.frameStartedAt = time;
      state.frameCount++;
    }

    if (frameLength < FRAME_DURATION / 2) {
      frameType = 'collecting'
      frameTypePercentage = frameLength / (FRAME_DURATION / 2)
    }
    else {
      frameType = 'outputting'
      frameTypePercentage = (frameLength - FRAME_DURATION / 2) / (FRAME_DURATION / 2)
    }
  }

  for (const operator of state.operators) {
    for (const node of operator.inputNodes) {
      const index = node.operators.indexOf(operator);

      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = '#ccc';
      context.setLineDash([5, 15]);
      context.moveTo(node.x, node.y);
      context.lineTo(operator.x, operator.y);
      context.stroke();

      if (node.activeOperator(state.frameCount) === operator && state.state === STATE_PLAYING) {
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = '#00c';
        context.setLineDash([]);
        context.moveTo(node.x, node.y);
        const progession = frameType === 'outputting' ? 1 : frameTypePercentage;
        context.lineTo(node.x + (operator.x - node.x) * progession, node.y + (operator.y - node.y) * progession);
        context.stroke();
      }

      if (index !== -1) {
        const numbers = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        const middle = [(node.x - operator.x) / 2, (node.y - operator.y) / 2]
        context.fillStyle = 'gray';
        context.textAlign = "center";
        context.textBaseline = "bottom";
        context.font = "12px serif";
        context.fillText(numbers[index], operator.x + middle[0], operator.y + middle[1] - 5);
      }
    }
    if (operator.outputNode) {
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = '#ccc';
      if (state.currentOperator === operator) {
        context.strokeStyle = '#c00';
      }

      context.setLineDash([15, 5]);
      context.moveTo(operator.outputNode.x, operator.outputNode.y);
      context.lineTo(operator.x, operator.y);
      context.stroke();

      if (operator.isActive(state.frameCount) && frameType == 'outputting') {
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = '#00c';
        context.setLineDash([]);
        context.moveTo(operator.x, operator.y);
        context.lineTo(operator.x + (operator.outputNode.x - operator.x) * frameTypePercentage, operator.y + (operator.outputNode.y - operator.y) * frameTypePercentage);
        context.stroke();
      }
    }
  }
  context.setLineDash([]);

  for (const node of state.nodes) {
    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
    context.fillStyle = node.fillColor();
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = 'black';
    context.stroke();
    if (node.value) {
      context.fillStyle = 'black'
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = "25px serif";
      context.fillText(node.value.toString(), node.x, node.y);
    }
  }

  for (const operator of state.operators) {
    context.beginPath();
    context.arc(operator.x, operator.y, operator.radius, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = state.state === STATE_PLAYING && operator.isActive(state.frameCount) ? '#00c' : 'gray';
    context.stroke();
    context.fillStyle = 'black'
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "25px serif";
    context.fillText(operator.operator, operator.x, operator.y);
  }


  renderHud(frameType);
  requestAnimationFrame(renderFrame);
}

renderFrame(0);
