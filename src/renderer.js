import { mat3 } from "gl-matrix";
import { createRenderPipeline } from "./pipeline";
import { Renderable } from "./renderable.js";

export class Renderer {
    canvas;
    ctx;
    renderQueue = [(Renderable)];
    // WGPU rendering:
    adapter;
    device;
    pipeline;
    textureFormat;
    // WebGL rendering:
    shaders = [];

    constructor(canvas, renderMode) {
        this.canvas = canvas;
        this.ctx = renderMode;
    }

    async init() {
        if (this.ctx instanceof GPUCanvasContext) {
            // WebGPU initialization:
            if (!navigator.gpu) {
                console.log("WebGPU not supported on this browser. Switching render mode to WebGL.");
                this.ctx = null;
                this.init();
            } else {
                console.log("WebGPU support confirmed.");
                this.adapter = await navigator.gpu.requestAdapter();

                if (!this.adapter) {
                    throw new Error("No appropriate GPU adapter found.");
                }

                this.ctx = this.canvas.getContext("webgpu");

                if (!this.ctx) {
                    throw new Error("Failed to initialize WebGPU.");
                }

                this.textureFormat = navigator.gpu.getPreferredCanvasFormat();
                this.device = await this.adapter.requestDevice();

                this.ctx.configure({
                    device: this.device,
                    format: this.textureFormat,
                });

                this.pipeline = await createRenderPipeline(
                    this.device,
                    (
                        await loadShaderWGPU("./shaders/triangle.wgsl", this.device)
                    )
                );
            }
            // initialization finished
        } else {
            // WebGL initialization:
            this.ctx = this.canvas.getContext("webgl2");

            if (!this.ctx) {
                this.ctx = this.canvas.getContext("experimental-webgl");
            }
            if (!this.ctx instanceof(WebGLRenderingContext | WebGL2RenderingContext)) {
                console.log("Failed to initialize WebGL. Switching to software rendering.");
                this.ctx = canvas.getContext("2d", { willReadFrequently: true });
            } else {
                this.shaderProgram = await loadShaderGL("./shaders/triangle_tMat.glsl", this.ctx);
            }
            // initialization finished
        }
        console.log(this.getCurrentAPI + " initialized.");
    }

    render() {
        // WebGPU rendering:
        if (this.getCurrentAPI === "WebGPU") {
            const renderPassDescriptor = {
                colorAttachments: [
                    {
                        view: this.ctx.getCurrentTexture().createView(),
                        loadOp: "clear",
                        storeOp: "store",
                        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    },
                ],
            };

            const commandEncoder = this.device.createCommandEncoder();
            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            passEncoder?.setPipeline(this.pipeline);

            this.renderQueue.forEach((renderable) => {
                renderable.updateBuffers(this);
                passEncoder.setVertexBuffer(0, renderable.vertexBuffer);
                passEncoder.setVertexBuffer(1, renderable.colorBuffer);
                passEncoder.setBindGroup(0, renderable.bindGroup);
                passEncoder?.draw(renderable.vertexCount, 1, 0, 0);
            });
            passEncoder?.end();
            this.device.queue.submit([commandEncoder.finish()]);
        } else if (this.getCurrentAPI === "WebGL") {
            // WebGL rendering:
            const program = this.glProgram;
            this.ctx.clearColor(0.0, 0.0, 0.0, 1.0);
            this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);

            this.renderQueue.forEach((renderable) => {
                /*
                if (this.shader?.shader instanceof WebGLProgram && this.shader?.hasTMat()) {
                    this.setPositionAttribute(this.ctx, renderable);
                    this.setColorAttribute(this.ctx, renderable);
                    this.ctx.useProgram(program);

                    const translationMatrix = mat3.create();
                    mat3.translate(translationMatrix, translationMatrix, renderable.position);

                    // Update uniform matrix
                    this.ctx.uniformMatrix3fv(
                        this.ctx.getUniformLocation(program, "uTranslationMatrix"),
                        false,
                        translationMatrix
                    );
                    this.ctx.drawArrays(this.ctx.TRIANGLES, 0, renderable.vertexCount);
                } else {
                    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, <WebGLBuffer>renderable.glVertexBuffer);
                    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, renderable.vertexData, this.ctx.DYNAMIC_DRAW); // Use DYNAMIC_DRAW
                    this.setPositionAttribute(this.ctx, renderable);
                    this.setColorAttribute(this.ctx, renderable);
                    this.ctx.useProgram(program);
                    this.ctx.drawArrays(this.ctx.TRIANGLES, 0, renderable.vertexCount);
                }
                */
                this.setPositionAttribute(this.ctx, renderable);
                this.setColorAttribute(this.ctx, renderable);
                this.ctx.useProgram(program);

                const translationMatrix = mat3.create();
                mat3.translate(translationMatrix, translationMatrix, renderable.position);

                // Update uniform matrix
                this.ctx.uniformMatrix3fv(
                    this.ctx.getUniformLocation(program, "uTranslationMatrix"),
                    false,
                    translationMatrix
                );
                this.ctx.drawArrays(this.ctx.TRIANGLES, 0, renderable.vertexCount);
            });
        } else {
            this.renderQueue.forEach((renderable) => {
                this.ctx.fillStyle = renderable.color;
                this.ctx.beginPath();
                this.ctx.moveTo(renderable.position.x, renderable.position.y);
                renderable.vertices.forEach(v => {
                    this.ctx.lineTo(v.x, v.y);
                });
                this.ctx.fill();
            });
        }
    }

    setPositionAttribute(ctx, renderable) {
        const numComponents = 2; // Number of values per vertex
        const type = ctx.FLOAT; // 32-bit floats
        const normalize = false;
        const stride = 0; // Use the defaults
        const offset = 0;

        ctx.bindBuffer(ctx.ARRAY_BUFFER, renderable.glVertexBuffer);
        ctx.vertexAttribPointer(
            ctx.getAttribLocation(this.glProgram, "aVertexPosition"),
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        ctx.enableVertexAttribArray(ctx.getAttribLocation(this.glProgram, "aVertexPosition"));
    }

    setColorAttribute(ctx, renderable) {
        const numComponents = 4;
        const type = ctx.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        ctx.bindBuffer(ctx.ARRAY_BUFFER, renderable.glColorBuffer);
        ctx.vertexAttribPointer(
            ctx.getAttribLocation(this.glProgram, "aVertexColor"),
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        ctx.enableVertexAttribArray(ctx.getAttribLocation(this.glProgram, "aVertexColor"));
    }

    getCurrentAPI() {
        if (this.ctx instanceof GPUCanvasContext)
            return "WebGPU";
        else if (this.ctx instanceof WebGL2RenderingContext | WebGLRenderingContext)
            return "WebGL";
        else
            return "Software Renderer";
    }

    get geometryCount() {
        return this.renderQueue.length;
    }
}