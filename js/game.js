export const canvas = document.getElementsByTagName('canvas')[0];

const contextMaybeNull = canvas.getContext("2d");
if (!contextMaybeNull) {
  throw new Error("unsupported api")
}
export const context = contextMaybeNull;

let itemId = 0;

export const STATE_SELECTING_NODE = 'selecting';
export const STATE_ADD_OPERATOR = 'operator';
export const STATE_ADD_OPERATOR_OUTPUT = 'output';
export const STATE_PLAYING = 'playing';
export const STATE_WON = 'won';

export class GameNode {
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
  /**
   * @type {GameOperator[]}
   */
  operators = [];

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

  fillColor() {
    return GameNode.colors[this.state];
  }

  activeOperator(frameCount) {
    if (this.operators.length === 0) {
      return null;
    }
    return this.operators[frameCount % this.operators.length];
  }

  isWriteable(value) {
    return (!this.isEndNode && this.defaultValue === 0) || (this.isEndNode && value == this.defaultValue);
  }
}

export class GameOperator {
  id;
  x;
  y;
  radius;
  operator;
  /**
   * @type {GameNode[]}
   */
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

  isActive(frameCount) {
    return this.inputNodes.every((node) => node.activeOperator(frameCount) === this && node.value)
  }

  outputValue() {
    const r = this.inputNodes[0].value + this.inputNodes[1].value;
    return isNaN(r) ? 0 : r;
  }
}

export const state = {
  state: STATE_SELECTING_NODE,
  frameStartedAt: document.timeline.currentTime,
  frameCount: 0,
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
