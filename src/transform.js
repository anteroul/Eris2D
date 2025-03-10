import { Vec2 } from "./vector.js";

export class Transform {
  velocity = new Vec2(0, 0);
  initialVelocity = this.velocity;
  acceleration = 0.0;
  force = 0.0;

  constructor(x, y, mass, deltaTime) {
    this.velocity = new Vec2(x / deltaTime, y / deltaTime);
    this.initialVelocity = this.velocity;
    this.acceleration =
      Math.sqrt(
        this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y,
      ) / deltaTime;
    this.force = this.acceleration * mass;
    if (
      this.acceleration * deltaTime >
      (this.initialVelocity.x + this.initialVelocity.y) / 2
    ) {
      this.velocity.x += (this.force / mass) * deltaTime;
      this.velocity.y += (this.force / mass) * deltaTime;
    } else {
      this.velocity = this.decelerate(
        this.velocity.x,
        this.velocity.y,
        deltaTime,
      );
    }
  }

  decelerate(vx, vy, deltaTime) {
    vx -= this.acceleration * deltaTime;
    vy -= this.acceleration * deltaTime;
    return new Vec2(
      vx + this.initialVelocity.x / 2,
      vy + this.initialVelocity.y / 2,
    );
  }
}
