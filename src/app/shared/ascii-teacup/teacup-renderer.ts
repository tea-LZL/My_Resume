/**
 * ASCII rasterizer for the teacup mesh. Pure: one transform pass, then a
 * z-buffered scan of every quad into a coarse cell grid. The frame is a
 * rectangular block of monospace characters; nothing here touches the DOM.
 */
import type { TeacupMesh } from "./teacup-mesh";
import { VERTEX_STRIDE } from "./teacup-mesh";

export const ASCII_RAMP = " .:-=+*#%@";
const EMPTY = 32;
const RAMP_CODES = Uint8Array.from(ASCII_RAMP, (glyph) => glyph.charCodeAt(0));

const LIGHT_X = 0.45;
const LIGHT_Y = 0.75;
const LIGHT_Z = 0.5;
const LIGHT_LENGTH = Math.hypot(LIGHT_X, LIGHT_Y, LIGHT_Z);

export interface FrameBuffer {
  readonly cols: number;
  readonly rows: number;
  readonly chars: Uint8Array;
  readonly depth: Float32Array;
  /** Rotated copy of the mesh vertices; grown on demand, never per frame. */
  rotated: Float32Array;
}

export interface RenderView {
  /** Mutated by the component between paints; the geometry is unchanged. */
  yaw: number;
  readonly pitch: number;
  readonly colsPerUnit: number;
  readonly rowsPerUnit: number;
  readonly originCol: number;
  readonly originRow: number;
}

/** Scratch for the four projected corners of one quad (x, y, z each). */
const corners = new Float32Array(12);

export function createFrameBuffer(cols: number, rows: number, vertexFloats: number): FrameBuffer {
  const cells = cols * rows;
  return {
    cols,
    rows,
    chars: new Uint8Array(cells).fill(EMPTY),
    depth: new Float32Array(cells),
    rotated: new Float32Array(vertexFloats),
  };
}

export function shadeIndex(material: number, lambert: number): number {
  const clampedLambert = lambert > 1 ? 1 : lambert < 0 ? 0 : lambert;
  const luminance = material * (0.32 + 0.68 * clampedLambert);
  const clamped = luminance > 0.999 ? 0.999 : luminance < 0 ? 0 : luminance;
  return Math.min(ASCII_RAMP.length - 1, Math.floor(clamped * ASCII_RAMP.length));
}

export function renderTeacup(mesh: TeacupMesh, buffer: FrameBuffer, view: RenderView): string {
  const { cols, rows, chars, depth } = buffer;
  chars.fill(EMPTY);
  depth.fill(Number.NEGATIVE_INFINITY);

  const { vertices, quads } = mesh;
  if (buffer.rotated.length !== vertices.length) {
    buffer.rotated = new Float32Array(vertices.length);
  }
  const rotated = buffer.rotated;

  const yawCos = Math.cos(view.yaw);
  const yawSin = Math.sin(view.yaw);
  const pitchCos = Math.cos(view.pitch);
  const pitchSin = Math.sin(view.pitch);

  for (let i = 0; i < vertices.length; i += VERTEX_STRIDE) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];
    const nx = vertices[i + 3];
    const ny = vertices[i + 4];
    const nz = vertices[i + 5];
    const rotatedX = x * yawCos + z * yawSin;
    const rotatedZ = -x * yawSin + z * yawCos;
    rotated[i] = rotatedX;
    rotated[i + 1] = y * pitchCos - rotatedZ * pitchSin;
    rotated[i + 2] = y * pitchSin + rotatedZ * pitchCos;

    const rotatedNx = nx * yawCos + nz * yawSin;
    const rotatedNz = -nx * yawSin + nz * yawCos;
    rotated[i + 3] = rotatedNx;
    rotated[i + 4] = ny * pitchCos - rotatedNz * pitchSin;
    rotated[i + 5] = ny * pitchSin + rotatedNz * pitchCos;
    rotated[i + 6] = vertices[i + 6];
  }

  const { colsPerUnit, rowsPerUnit, originCol, originRow } = view;

  for (let quad = 0; quad < quads.length; quad += 4) {
    let normalX = 0;
    let normalY = 0;
    let normalZ = 0;
    let material = 0;

    for (let corner = 0; corner < 4; corner++) {
      const base = quads[quad + corner] * VERTEX_STRIDE;
      const offset = corner * 3;
      corners[offset] = originCol + rotated[base] * colsPerUnit;
      corners[offset + 1] = originRow - rotated[base + 1] * rowsPerUnit;
      corners[offset + 2] = rotated[base + 2];
      normalX += rotated[base + 3];
      normalY += rotated[base + 4];
      normalZ += rotated[base + 5];
      material += rotated[base + 6];
    }

    // Math.hypot is ~10x slower than the explicit form and this runs per quad.
    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ) || 1;
    const lambert = Math.max(
      0,
      (normalX * LIGHT_X + normalY * LIGHT_Y + normalZ * LIGHT_Z) /
        (normalLength * LIGHT_LENGTH),
    );
    const code = RAMP_CODES[shadeIndex(material / 4, lambert)];

    let minX = corners[0];
    let maxX = corners[0];
    let minY = corners[1];
    let maxY = corners[1];
    for (let corner = 1; corner < 4; corner++) {
      const x = corners[corner * 3];
      const y = corners[corner * 3 + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    if (maxX < 0 || minX >= cols || maxY < 0 || minY >= rows) {
      continue;
    }

    const startX = Math.max(0, Math.floor(minX));
    const endX = Math.min(cols - 1, Math.ceil(maxX));
    const startY = Math.max(0, Math.floor(minY));
    const endY = Math.min(rows - 1, Math.ceil(maxY));
    let covered = false;

    for (let cellY = startY; cellY <= endY; cellY++) {
      const sampleY = cellY + 0.5;
      for (let cellX = startX; cellX <= endX; cellX++) {
        const sampleX = cellX + 0.5;
        const cell = cellY * cols + cellX;

        for (let triangle = 0; triangle < 2; triangle++) {
          const b = triangle === 0 ? 3 : 6;
          const c = b + 3;

          const ax = corners[0];
          const ay = corners[1];
          const bx = corners[b];
          const by = corners[b + 1];
          const cx = corners[c];
          const cy = corners[c + 1];

          // Edge functions; wa/wb/wc are the barycentric weights of A, B, C.
          const wa = (cx - bx) * (sampleY - by) - (cy - by) * (sampleX - bx);
          const wb = (ax - cx) * (sampleY - cy) - (ay - cy) * (sampleX - cx);
          const wc = (bx - ax) * (sampleY - ay) - (by - ay) * (sampleX - ax);

          if (!((wa >= 0 && wb >= 0 && wc >= 0) || (wa <= 0 && wb <= 0 && wc <= 0))) {
            continue;
          }

          const total = wa + wb + wc;
          if (Math.abs(total) < 1e-12) {
            continue;
          }

          const z = (wa * corners[2] + wb * corners[b + 2] + wc * corners[c + 2]) / total;
          if (z > depth[cell]) {
            depth[cell] = z;
            chars[cell] = code;
          }
          covered = true;
          break;
        }
      }
    }

    if (!covered) {
      const centroidX = Math.floor((corners[0] + corners[3] + corners[6] + corners[9]) / 4);
      const centroidY = Math.floor((corners[1] + corners[4] + corners[7] + corners[10]) / 4);
      if (centroidX >= startX && centroidX <= endX && centroidY >= startY && centroidY <= endY) {
        const cell = centroidY * cols + centroidX;
        const z = (corners[2] + corners[5] + corners[8] + corners[11]) / 4;
        if (z > depth[cell]) {
          depth[cell] = z;
          chars[cell] = code;
        }
      }
    }
  }

  const lines: string[] = [];
  for (let row = 0; row < rows; row++) {
    lines.push(String.fromCharCode(...chars.subarray(row * cols, (row + 1) * cols)));
  }

  return lines.join("\n");
}
