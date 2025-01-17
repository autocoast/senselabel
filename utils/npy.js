const npy = {};

const descrToConstructor = {
  "|u1": Uint8Array,
  "|i1": Int8Array,
  "<u2": Uint16Array,
  "<i2": Int16Array,
  "<u4": Uint32Array,
  "<i4": Int32Array,
  "<f4": Float32Array,
  "<f8": Float64Array,
};

const constructorNameToDescr = Object.fromEntries(
  Object.entries(descrToConstructor).map((x) => [x[1].name, x[0]])
);
constructorNameToDescr["Uint8ClampedArray"] = "|u1";

const constructorNameToNumBytes = {
  Uint8Array: 1,
  Int8Array: 1,
  Uint16Array: 2,
  Int16Array: 2,
  Uint32Array: 4,
  Int32Array: 4,
  Float32Array: 4,
  Float64Array: 8,
};

npy.tobuffer = function (ndarray) {
  const data = ndarray.data;
  const shape = ndarray.shape;
  const Typ = data.constructor;
  const dtype_bytes = constructorNameToNumBytes[Typ.name];

  const headerStr = `{'descr': '${constructorNameToDescr[data.constructor.name]}', 'fortran_order': ${["False", "True"][Number(ndarray.fortran_order)]}, 'shape': (${shape.join(", ")},), } `;
  
  // 64-byte alignment requirement
  let p = 0;
  while ((headerStr.length + 10 + p) % 64 !== 0) {
    p += 1;
  }

  const headlen = headerStr.length + p;
  const metalen = headlen + 10;

  // Entire buffer containing meta info and the data
  const buf = new ArrayBuffer(metalen + data.length * dtype_bytes);

  const view = new DataView(buf);

  // Magic
  view.setUint8(0, 147); // \x93
  view.setUint8(1, 78); // N
  view.setUint8(2, 85); // U
  view.setUint8(3, 77); // M
  view.setUint8(4, 80); // P
  view.setUint8(5, 89); // Y

  // Version
  view.setUint8(6, 1);
  view.setUint8(7, 0);

  // HEADER_LEN (little-endian)
  const n = (headlen << 8) & 0xff00 | ((headlen >> 8) & 0xff);
  view.setUint16(8, n);

  for (let i = 0; i < headlen; i++) {
    if (i < headerStr.length) {
      view.setUint8(10 + i, headerStr.charCodeAt(i));
    } else if (i === headlen - 1) {
      view.setUint8(10 + i, 0x0a); // Newline terminated
    } else {
      view.setUint8(10 + i, 0x20); // Space pad
    }
  }

  // Pretend the entire buffer is the same type as the TypedArray
  // and modify the underlying data
  new Typ(buf).set(data, metalen / dtype_bytes);

  return buf;
};

export default npy;
