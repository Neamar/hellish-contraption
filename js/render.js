import { context, state } from './game.js';

const renderFrame = (time) => {
  context.clearRect(0, 0, 1024, 780);

  for (const operator of state.operators) {
    for (const node of operator.inputNodes) {
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = '#ccc';
      context.setLineDash([5, 15]);
      context.moveTo(node.x, node.y);
      context.lineTo(operator.x, operator.y);
      context.stroke();
    }
    if (operator.outputNode) {
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = state.currentOperator === operator ? '#c00' : '#ccc';
      context.setLineDash([15, 5]);
      context.moveTo(operator.outputNode.x, operator.outputNode.y);
      context.lineTo(operator.x, operator.y);
      context.stroke();
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
    context.strokeStyle = 'gray';
    context.stroke();
    context.fillStyle = 'black'
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "25px serif";
    context.fillText(operator.operator, operator.x, operator.y);
  }

  context.fillStyle = 'black'
  context.textAlign = "left";
  context.textBaseline = "top";
  context.font = "10px serif";
  context.fillText(state.state, 0, 0);

  requestAnimationFrame(renderFrame);
}

renderFrame();
