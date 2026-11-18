/**
 * Procedural teacup geometry: a hollow vessel of revolution, a saucer, and a
 * swept handle. Pure math, no DOM, so the renderer stays testable.
 *
 * Vertex layout is interleaved with stride 7: x, y, z, nx, ny, nz, material.
 * Normals are derived from the profile tangent instead of quad winding: the
 * winding flips where the profile reverses at the rim, and a geometric normal
 * would light the cup's interior from the wrong side.
 */
export const VERTEX_STRIDE = 7;

export interface TeacupMesh {
  readonly vertices: Float32Array;
  readonly quads: Uint32Array;
}

export type ProfilePoint = readonly [r: number, y: number];

/** Base on the axis, up the outside, over the rim, and back down the inside. */
export const CUP_PROFILE: readonly ProfilePoint[] = [
  [0.0, 0.07],
  [0.12, 0.07],
  [0.16, 0.105],
  [0.24, 0.24],
  [0.33, 0.47],
  [0.43, 0.79],
  [0.48, 0.96],
  [0.5, 1.0],
  [0.484, 1.0],
  [0.44, 0.95],
  [0.345, 0.76],
  [0.245, 0.47],
  [0.17, 0.3],
  [0.12, 0.23],
  [0.0, 0.2],
];

export const SAUCER_PROFILE: readonly ProfilePoint[] = [
  [0.0, 0.0],
  [0.348, 0.0],
  [0.487, 0.018],
  [0.545, 0.038],
  [0.58, 0.052],
  [0.545, 0.062],
  [0.487, 0.056],
  [0.348, 0.04],
  [0.0, 0.066],
];

const TAU = Math.PI * 2;

const PROFILE_SAMPLES = 40;
const SAUCER_SAMPLES = 16;
const BODY_RADIAL_SEGMENTS = 44;
const SAUCER_RADIAL_SEGMENTS = 36;
const HANDLE_ARC_SEGMENTS = 20;
const HANDLE_TUBE_SIDES = 6;
const HANDLE_TUBE_RADIUS = 0.07;
const HANDLE_INSET = 0.02;

export const TEACUP_HEIGHT = 0.78;

const HANDLE_START: ProfilePoint = [0.24, 0.24 * TEACUP_HEIGHT];
const HANDLE_END: ProfilePoint = [0.43, 0.79 * TEACUP_HEIGHT];
const HANDLE_APEX: ProfilePoint = [0.72, 0.56 * TEACUP_HEIGHT];

/** Evenly spaced samples along the polyline's cumulative arc length. */
export function resampleProfile(points: readonly ProfilePoint[], count: number): ProfilePoint[] {
  if (!Number.isInteger(count) || count < 2) {
    throw new RangeError(`count must be an integer >= 2, received ${count}`);
  }
  if (points.length < 2) {
    throw new RangeError("profile needs at least two points");
  }

  const lengths = new Float64Array(points.length);
  for (let i = 1; i < points.length; i++) {
    lengths[i] =
      lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }

  const total = lengths[points.length - 1];
  if (total === 0) {
    return Array.from({ length: count }, () => points[0]);
  }

  const sampled: ProfilePoint[] = [];
  let segment = 0;
  for (let i = 0; i < count; i++) {
    const target = (total * i) / (count - 1);
    while (segment < points.length - 2 && lengths[segment + 1] < target) {
      segment++;
    }
    const span = lengths[segment + 1] - lengths[segment];
    const t = span === 0 ? 0 : (target - lengths[segment]) / span;
    const [r0, y0] = points[segment];
    const [r1, y1] = points[segment + 1];
    sampled.push([r0 + (r1 - r0) * t, y0 + (y1 - y0) * t]);
  }

  return sampled;
}

export function buildCupMesh(): TeacupMesh {
  const profile = resampleProfile(CUP_PROFILE, PROFILE_SAMPLES).map(
    ([r, y]): ProfilePoint => [r, y * TEACUP_HEIGHT],
  );
  return revolve(profile, BODY_RADIAL_SEGMENTS, "vessel");
}

export function buildSaucerMesh(): TeacupMesh {
  const profile = resampleProfile(SAUCER_PROFILE, SAUCER_SAMPLES).map(
    ([r, y]): ProfilePoint => [r, y * TEACUP_HEIGHT],
  );
  return revolve(profile, SAUCER_RADIAL_SEGMENTS, "solid");
}

export function buildHandleMesh(): TeacupMesh {
  const circle = circumcircle(HANDLE_START, HANDLE_END, HANDLE_APEX);
  const startAngle = Math.atan2(HANDLE_START[1] - circle.cy, HANDLE_START[0] - circle.cx);
  const endAngle = Math.atan2(HANDLE_END[1] - circle.cy, HANDLE_END[0] - circle.cx);
  const apexAngle = Math.atan2(HANDLE_APEX[1] - circle.cy, HANDLE_APEX[0] - circle.cx);

  let span = ((endAngle - startAngle) % TAU + TAU) % TAU;
  const apexOffset = ((apexAngle - startAngle) % TAU + TAU) % TAU;
  if (apexOffset > span) {
    span -= TAU;
  }

  const vertices: number[] = [];
  const quads: number[] = [];

  for (let k = 0; k <= HANDLE_ARC_SEGMENTS; k++) {
    const angle = startAngle + (span * k) / HANDLE_ARC_SEGMENTS;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const centerX = circle.cx + circle.radius * cos - (k === 0 || k === HANDLE_ARC_SEGMENTS ? HANDLE_INSET : 0);
    const centerY = circle.cy + circle.radius * sin;

    for (let side = 0; side < HANDLE_TUBE_SIDES; side++) {
      const phi = (side / HANDLE_TUBE_SIDES) * TAU;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      const nx = cosPhi * cos;
      const ny = cosPhi * sin;
      const nz = sinPhi;
      vertices.push(
        centerX + HANDLE_TUBE_RADIUS * nx,
        centerY + HANDLE_TUBE_RADIUS * ny,
        HANDLE_TUBE_RADIUS * nz,
        nx,
        ny,
        nz,
        1,
      );
    }
  }

  for (let k = 0; k < HANDLE_ARC_SEGMENTS; k++) {
    for (let side = 0; side < HANDLE_TUBE_SIDES; side++) {
      const next = (side + 1) % HANDLE_TUBE_SIDES;
      quads.push(
        k * HANDLE_TUBE_SIDES + side,
        k * HANDLE_TUBE_SIDES + next,
        (k + 1) * HANDLE_TUBE_SIDES + next,
        (k + 1) * HANDLE_TUBE_SIDES + side,
      );
    }
  }

  return { vertices: new Float32Array(vertices), quads: new Uint32Array(quads) };
}

export function buildTeacupMesh(): TeacupMesh {
  const parts = [buildCupMesh(), buildSaucerMesh(), buildHandleMesh()];
  const vertexLength = parts.reduce((total, part) => total + part.vertices.length, 0);
  const quadLength = parts.reduce((total, part) => total + part.quads.length, 0);
  const vertices = new Float32Array(vertexLength);
  const quads = new Uint32Array(quadLength);

  let vertexOffset = 0;
  let vertexBase = 0;
  let quadOffset = 0;
  for (const part of parts) {
    vertices.set(part.vertices, vertexOffset);
    for (let i = 0; i < part.quads.length; i++) {
      quads[quadOffset + i] = part.quads[i] + vertexBase;
    }
    vertexOffset += part.vertices.length;
    vertexBase += part.vertices.length / VERTEX_STRIDE;
    quadOffset += part.quads.length;
  }

  return { vertices, quads };
}

/**
 * `vessel` dims the cavity leg so the inside of the cup reads as shadow.
 * Quads after the rim are tagged 0.5; everything else stays fully lit.
 */
function revolve(
  profile: readonly ProfilePoint[],
  segments: number,
  style: "vessel" | "solid",
): TeacupMesh {
  const normals = profileNormals(profile);
  const cavityStart = style === "vessel" ? cavityStartIndex(profile) : profile.length;
  const vertices: number[] = [];
  const quads: number[] = [];

  for (let i = 0; i < profile.length; i++) {
    const [radius, height] = profile[i];
    const [normalR, normalY] = normals[i];
    const material = i >= cavityStart ? 0.5 : 1;
    for (let s = 0; s < segments; s++) {
      const angle = (s / segments) * TAU;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      vertices.push(
        radius * cos,
        height,
        radius * sin,
        normalR * cos,
        normalY,
        normalR * sin,
        material,
      );
    }
  }

  for (let i = 0; i < profile.length - 1; i++) {
    for (let s = 0; s < segments; s++) {
      const next = (s + 1) % segments;
      quads.push(
        i * segments + s,
        i * segments + next,
        (i + 1) * segments + next,
        (i + 1) * segments + s,
      );
    }
  }

  return { vertices: new Float32Array(vertices), quads: new Uint32Array(quads) };
}

function profileNormals(points: readonly ProfilePoint[]): [number, number][] {
  const normals: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    const previous = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dr = next[0] - previous[0];
    const dy = next[1] - previous[1];
    const length = Math.hypot(dr, dy);
    normals.push(length < 1e-9 ? [0, 1] : [dy / length, -dr / length]);
  }

  return normals;
}

function cavityStartIndex(profile: readonly ProfilePoint[]): number {
  let rim = 0;
  for (let i = 1; i < profile.length; i++) {
    if (profile[i][1] > profile[rim][1]) {
      rim = i;
    }
  }

  return rim + 1;
}

function circumcircle(a: ProfilePoint, b: ProfilePoint, c: ProfilePoint): { cx: number; cy: number; radius: number } {
  const determinant = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(determinant) < 1e-9) {
    return {
      cx: (a[0] + b[0]) / 2,
      cy: (a[1] + b[1]) / 2,
      radius: Math.hypot(b[0] - a[0], b[1] - a[1]) / 2,
    };
  }

  const aSquared = a[0] * a[0] + a[1] * a[1];
  const bSquared = b[0] * b[0] + b[1] * b[1];
  const cSquared = c[0] * c[0] + c[1] * c[1];
  const cx = (aSquared * (b[1] - c[1]) + bSquared * (c[1] - a[1]) + cSquared * (a[1] - b[1])) / determinant;
  const cy = (aSquared * (c[0] - b[0]) + bSquared * (a[0] - c[0]) + cSquared * (b[0] - a[0])) / determinant;

  return { cx, cy, radius: Math.hypot(a[0] - cx, a[1] - cy) };
}
