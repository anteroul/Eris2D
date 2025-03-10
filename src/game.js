import rl from "raylib";
import { GameObject } from "./gameObject.js";

export class Game {
  gameObjects = [GameObject];
  screenWidth = 800;
  screenHeight = 600;

  constructor(width, height) {
    // define screen res
    this.screenWidth = width;
    this.screenHeight = height;
    // init window
    rl.InitWindow(this.screenWidth, this.screenHeight, "Physics Engine");
    // create game objects
    this.gameObjects.push(new GameObject(300, 250, 3));
    this.gameObjects.push(new GameObject(200, 400, 5));
    this.gameObjects.push(new GameObject(400, 70, 4));
    this.gameObjects.push(new GameObject(50, 125, 5));
    this.gameObjects.push(new GameObject(250, 300, 2));
    this.gameObjects.push(new GameObject(420, 69, 3));
    this.gameObjects.push(new GameObject(18, 256, 4));
    // set supported refresh rate as the target framerate
    rl.SetTargetFPS(rl.GetMonitorRefreshRate(rl.GetCurrentMonitor()));
    // game loop:
    while (!rl.WindowShouldClose()) {
      this.GameLoop();
    }
    this.ExitGame();
  }

  GetRandomColor() {
    switch (Math.floor(Math.random() * 16)) {
      case 0:
        return rl.GRAY;
      case 1:
        return rl.WHITE;
      case 2:
        return rl.MAGENTA;
      case 3:
        return rl.MAROON;
      case 4:
        return rl.GREEN;
      case 5:
        return rl.SKYBLUE;
      case 6:
        return rl.BLUE;
      case 7:
        return rl.RED;
      case 8:
        return rl.YELLOW;
      case 9:
        return rl.ORANGE;
      case 10:
        return rl.GOLD;
      case 11:
        return rl.LIME;
      case 12:
        return rl.VIOLET;
      case 13:
        return rl.PURPLE;
      case 14:
        return rl.PINK;
      case 15:
        return rl.DARKBLUE;
      default:
        return rl.DARKGRAY;
    }
  }

  Render() {
    rl.BeginDrawing();
    rl.ClearBackground(rl.BLACK);
    this.gameObjects.forEach((obj) => {
      rl.DrawCircle(obj.position.x, obj.position.y, obj.mass, this.GetRandomColor());
    });
    rl.EndDrawing();
  }

  GameLoop() {
    this.gameObjects.forEach((obj) => {
      obj.update(rl.GetFrameTime());
    });
    this.Render();
  }

  ExitGame() {
    rl.CloseWindow();
  }
}
