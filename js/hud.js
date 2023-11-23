import { resetGameState } from './events.js';
import { STATE_PLAYING, STATE_SELECTING_NODE, canvas, context, state } from './game.js'

export const HUD_Y = 700;
const centerY = (canvas.height - HUD_Y) / 2;

const HUD_STATE_DEFAULT = 'default';
const HUD_STATE_PLAY_HOVERED = 'hovered';
let hudState = HUD_STATE_DEFAULT;

export const renderHud = () => {
  context.beginPath();
  context.fillStyle = 'black'
  context.textAlign = "right";
  context.textBaseline = "bottom";
  context.font = "10px serif";
  context.fillText(state.state, canvas.width - 4, canvas.height - 4);

  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = 'gray';
  context.moveTo(0, 700)
  context.lineTo(1024, 700)
  context.stroke();

  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = 'gray';
  const arrowSize = 30;
  context.moveTo(70, centerY + HUD_Y);
  context.lineTo(70 - centerY, HUD_Y + centerY - arrowSize / 2);
  context.lineTo(70 - centerY, HUD_Y + centerY + arrowSize / 2);
  context.lineTo(70, centerY + HUD_Y);
  context.stroke();
  if (hudState === HUD_STATE_DEFAULT) {
    context.fillStyle = "white";
  }
  else if (hudState === HUD_STATE_PLAY_HOVERED) {
    context.fillStyle = "gray"
  }
  if (state.state === STATE_PLAYING) {
    context.fillStyle = "green"
  }
  context.fill();
}

const overPlayButton = (x, y) => x > 70 - centerY && x < 70 && y > HUD_Y
canvas.addEventListener("mousemove", (e) => {
  if (e.offsetY < HUD_Y) {
    if (hudState !== HUD_STATE_DEFAULT) {
      canvas.style.cursor = 'default';
      hudState = HUD_STATE_DEFAULT;
    }
    return;
  }

  if (overPlayButton(e.offsetX, e.offsetY)) {
    hudState = HUD_STATE_PLAY_HOVERED;
    canvas.style.cursor = 'pointer';
  }
  else {
    hudState = HUD_STATE_DEFAULT;
    canvas.style.cursor = 'default';
  }
});

canvas.addEventListener("click", (e) => {
  if (state.state !== STATE_PLAYING && hudState === HUD_STATE_PLAY_HOVERED) {
    resetGameState();
    state.state = STATE_PLAYING;
    state.frameCount = 0;
    state.frameStartedAt = document.timeline.currentTime;
    return;
  }
  if (overPlayButton(e.offsetX, e.offsetY) && state.state === STATE_PLAYING) {
    console.log("clicked")
    state.state = STATE_SELECTING_NODE;
  }
});
