import './styles/base.css';
import './styles/ui.css';

import { SceneManager } from './engine/SceneManager';
import { AudioEngine } from './audio/AudioEngine';
import { HapticsEngine } from './audio/HapticsEngine';
import { TriviaEngine } from './engine/TriviaEngine';
import { GameController } from './game/GameController';
import { UIManager } from './ui/UIManager';
import { TouchController } from './ui/TouchController';

function bootstrap(): void {
  const canvasRoot = document.getElementById('canvas-root');
  const uiRoot = document.getElementById('ui-root');

  if (!canvasRoot || !uiRoot) {
    throw new Error('Missing #canvas-root or #ui-root mount elements.');
  }

  const scene = new SceneManager();
  scene.mount(canvasRoot);

  const audio = new AudioEngine();
  const haptics = new HapticsEngine();
  const trivia = new TriviaEngine();

  let ui: UIManager | null = null;

  const controller = new GameController({
    scene,
    audio,
    haptics,
    trivia,
    onStateChange: (state) => {
      ui?.render(state);
    },
  });

  const actions = controller.getActions();
  ui = new UIManager(uiRoot, actions);

  const touch = new TouchController(canvasRoot, () => controller.getState(), actions);
  touch.attach();

  // Render initial state & kick off controller loop
  controller.start();
  ui.render(controller.getState());

  // Clean unmount on hot reload / unload
  window.addEventListener('beforeunload', () => {
    touch.dispose();
    ui?.dispose();
    controller.dispose();
    scene.dispose();
  });
}

bootstrap();
