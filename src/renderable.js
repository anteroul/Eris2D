import { Vec2 } from "./vector";

export class Renderable {
    position = new Vec2(0, 0)
    vertices = [(Vec2)];
    color = ([Float32Array]);

    constructor(pos, vert, color) {
        this.position = pos;
        this.vertices = vert;
        this.color = color;
    }
}