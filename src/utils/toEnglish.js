export function toEnglish(str) {
  const map = { "૦":"0","૧":"1","૨":"2","૩":"3","૪":"4",
                "૫":"5","૬":"6","૭":"7","૮":"8","૯":"9" };
  return str.replace(/[૦-૯]/g, d => map[d]);
}
