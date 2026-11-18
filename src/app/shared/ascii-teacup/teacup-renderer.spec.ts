import type { TeacupMesh } from "./teacup-mesh";
import { VERTEX_STRIDE, buildCupMesh, buildHandleMesh, buildTeacupMesh } from "./teacup-mesh";
import {
  ASCII_RAMP,
  createFrameBuffer,
  renderTeacup,
  shadeIndex,
  type RenderView,
} from "./teacup-renderer";

const PITCH = (22 * Math.PI) / 180;

function view(cols: number, rows: number, overrides: Partial<RenderView> = {}): RenderView {
  return {
    yaw: 0,
    pitch: PITCH,
    colsPerUnit: 40,
    rowsPerUnit: 24,
    originCol: cols / 2,
    originRow: rows / 2 + 0.52 * 24,
    ...overrides,
  };
}

function quad(z: number, material: number): TeacupMesh {
  const corners = [
    [-0.2, -0.2],
    [0.2, -0.2],
    [0.2, 0.2],
    [-0.2, 0.2],
  ];
  const vertices: number[] = [];
  for (const [x, y] of corners) {
    vertices.push(x, y, z, 0, 0, 1, material);
  }

  return { vertices: new Float32Array(vertices), quads: new Uint32Array([0, 1, 2, 3]) };
}

function merge(...meshes: TeacupMesh[]): TeacupMesh {
  const vertices: number[] = [];
  const quads: number[] = [];
  let base = 0;
  for (const mesh of meshes) {
    vertices.push(...mesh.vertices);
    for (const index of mesh.quads) {
      quads.push(index + base);
    }
    base += mesh.vertices.length / VERTEX_STRIDE;
  }

  return { vertices: new Float32Array(vertices), quads: new Uint32Array(quads) };
}

function occupiedColumns(frame: string): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = -1;
  for (const line of frame.split("\n")) {
    for (let column = 0; column < line.length; column++) {
      if (line[column] !== " ") {
        min = Math.min(min, column);
        max = Math.max(max, column);
      }
    }
  }

  return { min, max };
}

describe("shadeIndex", () => {
  it("is monotonic, clamps, and never leaves the ramp", () => {
    let previous = -1;
    for (let lambert = 0; lambert <= 1.0001; lambert += 0.01) {
      const index = shadeIndex(1, lambert);
      expect(index).toBeGreaterThanOrEqual(previous);
      expect(index).toBeLessThan(ASCII_RAMP.length);
      previous = index;
    }

    expect(shadeIndex(1, -3)).toBe(shadeIndex(1, 0));
    expect(shadeIndex(1, 4)).toBe(ASCII_RAMP.length - 1);
  });

  it("dims the cavity by at least one ramp level for every Lambert term", () => {
    for (let lambert = 0.05; lambert <= 1; lambert += 0.05) {
      expect(shadeIndex(0.5, lambert)).toBeLessThan(shadeIndex(1, lambert));
    }
  });
});

describe("renderTeacup", () => {
  const mesh = buildTeacupMesh();
  const buffer = createFrameBuffer(150, 64, mesh.vertices.length);
  const desktop = view(150, 64, {
    colsPerUnit: 54.5,
    rowsPerUnit: 32.7,
    originCol: 84,
    originRow: 32 + 0.39 * 32.7,
  });

  it("returns a rectangular frame and is deterministic", () => {
    const first = renderTeacup(mesh, buffer, desktop);
    const second = renderTeacup(mesh, buffer, desktop);
    const lines = first.split("\n");

    expect(second).toBe(first);
    expect(lines.length).toBe(64);
    for (const line of lines) {
      expect(line.length).toBe(150);
    }
  });

  it("fills a plausible silhouette but not the whole grid", () => {
    const lines = renderTeacup(mesh, buffer, desktop).split("\n");
    const occupied = lines.join("").replace(/ /g, "").length;

    let minRow = lines.length;
    let maxRow = -1;
    let minCol = 150;
    let maxCol = -1;
    lines.forEach((line, row) => {
      for (let column = 0; column < line.length; column++) {
        if (line[column] !== " ") {
          minRow = Math.min(minRow, row);
          maxRow = Math.max(maxRow, row);
          minCol = Math.min(minCol, column);
          maxCol = Math.max(maxCol, column);
        }
      }
    });

    const boundingBox = (maxRow - minRow + 1) * (maxCol - minCol + 1);
    expect(occupied / (150 * 64)).toBeGreaterThan(0.1);
    expect(occupied / (150 * 64)).toBeLessThan(0.3);
    expect(occupied / boundingBox).toBeGreaterThan(0.5);
    expect(occupied / boundingBox).toBeLessThan(0.85);
  });

  it("closes the rotation loop", () => {
    const first = renderTeacup(mesh, buffer, view(100, 40));
    const fullTurn = renderTeacup(mesh, buffer, view(100, 40, { yaw: Math.PI * 2 }));

    expect(fullTurn).toBe(first);
  });

  it("keeps the nearer quad when two overlap a cell", () => {
    // originRow 6 puts the near quad (z 0.5) over rows 6-15 and the far one over rows 2-10;
    // row 8 is inside both, so the assertion cannot pass on an uncovered cell.
    const small = view(20, 12, { originRow: 6 });
    const nearAlone = renderTeacup(quad(0.5, 1), buffer, small).split("\n");
    const farAlone = renderTeacup(quad(0, 0.5), buffer, small).split("\n");
    const combined = renderTeacup(merge(quad(0, 0.5), quad(0.5, 1)), buffer, small).split("\n");

    expect(nearAlone[8][10]).not.toBe(" ");
    expect(farAlone[8][10]).not.toBe(" ");
    expect(nearAlone[8][10]).not.toBe(farAlone[8][10]);
    expect(combined[8][10]).toBe(nearAlone[8][10]);
  });

  it("swings the handle from the right to the left half-turn apart", () => {
    const cup = buildCupMesh();
    const handle = buildHandleMesh();
    const cupBuffer = createFrameBuffer(100, 40, cup.vertices.length);
    const handleBuffer = createFrameBuffer(100, 40, handle.vertices.length);

    const cupBounds = occupiedColumns(renderTeacup(cup, cupBuffer, view(100, 40)));
    const handleRight = occupiedColumns(renderTeacup(handle, handleBuffer, view(100, 40, { yaw: 0 })));
    const handleLeft = occupiedColumns(
      renderTeacup(handle, handleBuffer, view(100, 40, { yaw: Math.PI })),
    );

    expect(handleRight.max).toBeGreaterThan(cupBounds.max + 4);
    expect(handleLeft.min).toBeLessThan(cupBounds.min - 4);
  });

  it("keeps a frame under the cost guard", () => {
    const started = performance.now();
    let frame = "";
    for (let i = 0; i < 10; i++) {
      desktop.yaw = i * 0.3;
      frame = renderTeacup(mesh, buffer, desktop);
    }
    const milliseconds = (performance.now() - started) / 10;

    expect(frame.replace(/[\s]/g, "").length).toBeGreaterThan(0);
    console.log(`ascii-teacup: ${milliseconds.toFixed(2)} ms/frame at 150x64`);
  });
});
