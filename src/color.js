import { vec3, vec4 } from "gl-matrix";

export class Color {
    col = vec3;
    rgba = vec4;
    
    constructor(r, g, b) {
        this.col = vec3[r, g, b];
        this.rgba = vec4[this.col, 255];
    }

    setAlpha(amount) {
        if (amount > 255) {
            amount = 255;
        }
        if (amount < 0) {
            amount = 0;
        }
        this.rgba[3] = amount;
    }
}