import chroma from "chroma-js";

function colorScheme(key: number | "default" | "danger") {
  if (key === "default") return "#00000050";
  if (key === "danger") return "#ff0000c0";
  return chroma.brewer.Set2[key % 10];
}

export default colorScheme;
