import {
  VERTEX_STRIDE,
  buildCupMesh,
  buildSaucerMesh,
  buildTeacupMesh,
  resampleProfile,
  type TeacupMesh,
} from "./teacup-mesh";

function maxRadius(mesh: TeacupMesh): number {
  let radius = 0;
  for (let i = 0; i < mesh.vertices.length; i += VERTEX_STRIDE) {
    radius = Math.max(radius, Math.hypot(mesh.vertices[i], mesh.vertices[i + 2]));
  }

  return radius;
}

describe("resampleProfile", () => {
  it("spaces points evenly along the polyline and keeps both ends", () => {
    const sampled = resampleProfile(
      [
        [0, 0],
        [0.3, 0.4],
      ],
      6,
    );

    expect(sampled.length).toBe(6);
    expect(sampled[0]).toEqual([0, 0]);
    expect(sampled[5][0]).toBeCloseTo(0.3, 10);
    expect(sampled[5][1]).toBeCloseTo(0.4, 10);
    for (let i = 1; i < sampled.length; i++) {
      expect(Math.hypot(sampled[i][0] - sampled[i - 1][0], sampled[i][1] - sampled[i - 1][1])).toBeCloseTo(
        0.1,
        10,
      );
    }
  });

  it("rejects a count that cannot produce a line", () => {
    expect(() =>
      resampleProfile(
        [
          [0, 0],
          [1, 1],
        ],
        1,
      ),
    ).toThrowError(RangeError);
  });
});

describe("teacup mesh", () => {
  const mesh = buildTeacupMesh();
  const vertexCount = mesh.vertices.length / VERTEX_STRIDE;

  it("interleaves seven floats per vertex and indexes only existing vertices", () => {
    expect(mesh.vertices.length % VERTEX_STRIDE).toBe(0);
    expect(mesh.quads.length % 4).toBe(0);
    expect(mesh.vertices.every(Number.isFinite)).toBeTrue();
    expect(Math.max(...mesh.quads)).toBeLessThan(vertexCount);
  });

  it("stays inside the fitted world box", () => {
    for (let i = 0; i < mesh.vertices.length; i += VERTEX_STRIDE) {
      expect(mesh.vertices[i + 1]).toBeGreaterThan(-1e-4);
      expect(mesh.vertices[i + 1]).toBeLessThan(0.785);
      expect(Math.hypot(mesh.vertices[i], mesh.vertices[i + 2])).toBeLessThan(0.82);
    }
  });

  it("dims only the cup's cavity leg, never the saucer", () => {
    const cup = buildCupMesh();
    let cavity = 0;
    let total = 0;
    for (let i = 6; i < cup.vertices.length; i += VERTEX_STRIDE) {
      expect([0.5, 1]).toContain(cup.vertices[i]);
      total++;
      if (cup.vertices[i] === 0.5) {
        cavity++;
      }
    }

    expect(cavity / total).toBeGreaterThan(0.35);
    expect(cavity / total).toBeLessThan(0.55);

    const saucer = buildSaucerMesh();
    for (let i = 6; i < saucer.vertices.length; i += VERTEX_STRIDE) {
      expect(saucer.vertices[i]).toBe(1);
    }
  });

  it("rests the cup on a saucer that is wider than the rim", () => {
    expect(maxRadius(buildSaucerMesh())).toBeGreaterThan(maxRadius(buildCupMesh()));
  });
});
