import rl from "raylib";
import { Vec2 } from "./vector.js";
import { Transform } from "./transform.js";
import { BehaviourScript } from "./behaviourScript.js";

export class GameObject {
  position = new Vec2(0, 0);
  vertices = [Vec2];
  mass = 2;
  cm = this.position;
  transform;
  scripts = [BehaviourScript];
  colour = [(255, 255, 255, 255)];

  constructor(x, y, mass) {
    this.position = new Vec2(x, y);
    this.vertices = [this.position];
    this.mass = mass;
    this.cm = this.calculateCentroid(this.vertices);
    this.transform = new Transform(0, 0, this.mass, 0.0);
    this.scripts = [];
  }

  attachScript(script) {
    this.scripts.push(script);
  }

  setColour(colour) {
    this.colour = colour;
  }

  translate(x, y, deltaTime) {
    this.position = new Transform(x, y, this.mass, deltaTime).velocity;
  }

  update() {
    var deltaTime = rl.GetFrameTime();
    this.scripts.forEach((i) => {
      i.update(deltaTime);
    });
    this.translate(this.position.x, this.position.y, deltaTime);
  }

  calculateCentroid(vertices) {
    let signedArea = 0;
    let centroidX = 0;
    let centroidY = 0;

    const numVertices = vertices.length;

    for (let i = 0; i < numVertices; i++) {
      let j = (i + 1) % numVertices; // Next vertex (looping back to first at the end)

      let x0 = vertices[i].x,
        y0 = vertices[i].y;
      let x1 = vertices[j].x,
        y1 = vertices[j].y;

      let crossProduct = x0 * y1 - x1 * y0; // Determinant term

      signedArea += crossProduct;
      centroidX += (x0 + x1) * crossProduct;
      centroidY += (y0 + y1) * crossProduct;
    }

    signedArea *= 0.5;

    centroidX = centroidX / (6 * signedArea);
    centroidY = centroidY / (6 * signedArea);

    return new Vec2(centroidX, centroidY);
  }
}
