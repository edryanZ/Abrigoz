function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}
const u16 = (value) => [value & 255, value >>> 8 & 255];
const u32 = (value) => [value & 255, value >>> 8 & 255, value >>> 16 & 255, value >>> 24 & 255];

export function createSingleFileZip(filename, content) {
  const encoder = new TextEncoder();
  const name = encoder.encode(filename);
  const data = encoder.encode(content);
  const crc = crc32(data);
  const local = new Uint8Array([
    ...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),
    ...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...name,...data,
  ]);
  const central = new Uint8Array([
    ...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),
    ...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),
    ...u16(0),...u16(0),...u32(0),...u32(0),...name,
  ]);
  return new Uint8Array([...local,...central,...u32(0x06054b50),...u16(0),...u16(0),
    ...u16(1),...u16(1),...u32(central.length),...u32(local.length),...u16(0)]);
}
