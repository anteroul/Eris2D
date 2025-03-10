import { GameObject } from "./gameObject.js";

export class BehaviourScript {
  gameObject;
  time;

  constructor(obj) {
    this.gameObject = new GameObject(obj.position.x, obj.position.y, obj.mass);
    this.time = 0.0;
  }

  update(deltaTime) {
    this.time = deltaTime;
  }
}
