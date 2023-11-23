import { GameNode, GameOperator, STATE_ADD_OPERATOR, STATE_ADD_OPERATOR_OUTPUT, STATE_SELECTING_NODE, canvas, state } from './game.js';
import { HUD_Y } from './hud.js';

const findHoveredItem = (mouseX, mouseY) => state.nodes.find((node) => node.distanceTo(mouseX, mouseY) < node.radius);
const findClosestNode = (mouseX, mouseY, exclude = new Set()) => state.nodes.reduce((closest, node) => {
  if (exclude.has(node)) {
    return closest;
  }
  return node.distanceTo(mouseX, mouseY) < closest.distanceTo(mouseX, mouseY) ? node : closest
}, new GameNode({ x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER }));


canvas.addEventListener("mousemove", (e) => {
  if (e.offsetY >= HUD_Y) {
    return;
  }

  if (state.state === STATE_SELECTING_NODE) {
    const hovered = findHoveredItem(e.offsetX, e.offsetY)
    for (const node of state.nodes) {
      if (node === hovered && node.state === "default") {
        node.state = 'hovered'
      }
      else if (node.state === 'hovered' && node !== hovered) {
        node.state = 'default'
      }
    }
  }
  else if (state.state === STATE_ADD_OPERATOR && state.currentOperator) {
    state.currentOperator.x = e.offsetX;
    state.currentOperator.y = e.offsetY;
  }
  else if (state.state === STATE_ADD_OPERATOR_OUTPUT && state.currentOperator) {
    state.currentOperator.outputNode = findClosestNode(e.offsetX, e.offsetY, new Set(state.currentOperator.inputNodes));
  }
})

canvas.addEventListener("click", (e) => {
  if (e.offsetY >= HUD_Y) {
    return;
  }

  if (state.state === STATE_SELECTING_NODE) {
    const hovered = findHoveredItem(e.offsetX, e.offsetY);
    if (hovered) {
      hovered.state = hovered.state !== 'selected' ? 'selected' : 'hovered'
    }

    const selected = state.nodes.filter((node) => node.state === 'selected');
    if (selected.length === 2) {
      state.state = STATE_ADD_OPERATOR;
      state.currentOperator = new GameOperator({
        x: e.offsetX,
        y: e.offsetY,
        operator: '+',
        inputNodes: selected,
      });
      state.operators.push(state.currentOperator)
    }
  }
  else if (state.state === STATE_ADD_OPERATOR) {
    state.state = STATE_ADD_OPERATOR_OUTPUT;
  }
  else if (state.state === STATE_ADD_OPERATOR_OUTPUT) {
    state.currentOperator = null;
    state.state = STATE_SELECTING_NODE;
    const hovered = findHoveredItem(e.offsetX, e.offsetY)
    state.nodes.forEach((node) => node.state = hovered === node ? 'hovered' : 'default');
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (state.state === STATE_ADD_OPERATOR || state.state === STATE_ADD_OPERATOR_OUTPUT) {
    resetGameState(e.offsetX, e.offsetY);
  }
})


export const resetGameState = (x, y) => {
  state.state = STATE_SELECTING_NODE;
  const hovered = findHoveredItem(x, y)
  state.nodes.forEach((node) => node.state = hovered === node ? 'hovered' : 'default');
  if (state.currentOperator) {
    state.operators.pop();
    state.currentOperator = null;
  }
}
