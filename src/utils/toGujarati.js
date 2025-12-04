export function toGujarati(num) {
  const map = { "0": "૦","1": "૧","2": "૨","3": "૩","4": "૪",
                "5": "૫","6": "૬","7": "૭","8": "૮","9": "૯" };
  return String(num).replace(/[0-9]/g, d => map[d]);
}
