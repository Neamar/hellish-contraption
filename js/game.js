const canvas = document.getElementsByTagName('canvas')[0];

const context = canvas.getContext("2d");
if (!context) {
  throw new Error("unsupported api")
}

let itemId = 0;

const STATE_SELECTING = 'selecting';
const STATE_OPERATOR = 'operator';
const STATE_OUTPUT = 'output';

class GameNode {
  id;
  value;
  endNodeValue;
  x;
  y;
  radius;
  state;

  constructor({ id = undefined, value = 0, x, y, endNodeValue = 0 }) {
    this.id = id || itemId++;
    this.value = value;
    this.endNodeValue = endNodeValue;
    this.x = x;
    this.y = y;
    this.radius = 40;
    this.state = 'default';
  }
}

class GameOperator {
  id;
  x;
  y;
  radius;
  operator;
  inputNodes;

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
  state: STATE_SELECTING,
  nodes: [
    new GameNode({ value: 1, x: 100, y: 200 }),
    new GameNode({ value: 1, x: 100, y: 500 }),
    new GameNode({ x: 500, y: 200 }),
    new GameNode({ x: 500, y: 500 }),
    new GameNode({ x: 900, y: 350 }),
  ],
  /**
   * @type {GameOperator[]}
   */
  operators: [],
  /**
   * @type {GameOperator?}
   */
  currentSelection: null,
};

const colors = {
  default: 'white',
  hovered: '#ccc',
  selected: "#888"
}


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
  }
  context.setLineDash([]);

  for (const node of state.nodes) {
    context.beginPath();
    context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
    context.fillStyle = colors[node.state];
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

  requestAnimationFrame(renderFrame);
}

renderFrame();


const findHoveredItem = (mouseX, mouseY) => state.nodes.find((node) => Math.sqrt(Math.pow(mouseX - node.x, 2) + Math.pow(mouseY - node.y, 2)) < node.radius);

canvas.addEventListener("mousemove", (e) => {
  if (state.state === STATE_SELECTING) {
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
  else if (state.state === STATE_OPERATOR && state.currentSelection) {
    state.currentSelection.x = e.offsetX;
    state.currentSelection.y = e.offsetY;
  }
  else if (state.state === STATE_OUTPUT) {

  }
})

canvas.addEventListener("click", (e) => {
  if (state.state === STATE_SELECTING) {
    const hovered = findHoveredItem(e.offsetX, e.offsetY);
    if (hovered) {
      hovered.state = hovered.state !== 'selected' ? 'selected' : 'hovered'
    }

    const selected = state.nodes.filter((node) => node.state === 'selected');
    if (selected.length === 2) {
      state.state = STATE_OPERATOR;
      state.currentSelection = new GameOperator({
        x: e.offsetX,
        y: e.offsetY,
        operator: '+',
        inputNodes: selected,
      });
      state.operators.push(state.currentSelection)
    }
  }
  else if (state.state === STATE_OPERATOR) {
    state.state = STATE_OUTPUT;
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (state.state === STATE_OPERATOR) {
    state.state = STATE_SELECTING;
    const hovered = findHoveredItem(e.offsetX, e.offsetY)
    state.nodes.forEach((node) => node.state = hovered === node ? 'hovered' : 'default');
    state.operators.pop();
  }
})
