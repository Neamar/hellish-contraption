const canvas = document.getElementsByTagName('canvas')[0];

const context = canvas.getContext("2d");
if (!context) {
  throw new Error("unsupported api")
}

let itemId = 0;

const STATE_SELECTING_NODE = 'selecting';
const STATE_ADD_OPERATOR = 'operator';
const STATE_ADD_OPERATOR_OUTPUT = 'output';

class GameNode {
  static colors = {
    default: 'white',
    hovered: '#ccc',
    selected: "#888"
  }
  id;
  value;
  defaultValue;
  endNodeValue;
  x;
  y;
  radius;
  state;

  constructor({ id = undefined, defaultValue = 0, x, y, isEndNode = false }) {
    this.id = id || itemId++;
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.isEndNode = isEndNode;
    this.x = x;
    this.y = y;
    this.radius = 40;
    this.state = 'default';
  }

  distanceTo(x, y) {
    return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
  }
}

class GameOperator {
  id;
  x;
  y;
  radius;
  operator;
  inputNodes;
  /**
   * @type {GameNode?}
   */
  outputNode;

  constructor({ x, y, operator = '+', inputNodes }) {
    this.id = itemId++;
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.operator = operator;
    this.inputNodes = inputNodes
  }
}

const state = {
  state: STATE_SELECTING_NODE,
  nodes: [
    new GameNode({ defaultValue: 1, x: 100, y: 200 }),
    new GameNode({ defaultValue: 1, x: 100, y: 500 }),
    new GameNode({ x: 500, y: 200 }),
    new GameNode({ x: 500, y: 500 }),
    new GameNode({ defaultValue: 5, x: 900, y: 350, isEndNode: true }),
  ],
  /**
   * @type {GameOperator[]}
   */
  operators: [],
  /**
   * @type {GameOperator?}
   */
  currentOperator: null,
};


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
    context.fillStyle = GameNode.colors[node.state];
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


const findHoveredItem = (mouseX, mouseY) => state.nodes.find((node) => node.distanceTo(mouseX, mouseY) < node.radius);
const findClosestNode = (mouseX, mouseY, exclude = new Set()) => state.nodes.reduce((closest, node) => {
  if (exclude.has(node)) {
    return closest;
  }
  return node.distanceTo(mouseX, mouseY) < closest.distanceTo(mouseX, mouseY) ? node : closest
}, new GameNode({ x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER }));

canvas.addEventListener("mousemove", (e) => {
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
  if (state.state === STATE_ADD_OPERATOR) {
    state.state = STATE_SELECTING_NODE;
    const hovered = findHoveredItem(e.offsetX, e.offsetY)
    state.nodes.forEach((node) => node.state = hovered === node ? 'hovered' : 'default');
    state.operators.pop();
  }
})
