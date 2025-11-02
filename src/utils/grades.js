export function calcFinal(cc, gk, ck) {
  const hasAll = [cc, gk, ck].every(v => v !== null && v !== undefined && v !== '' && !Number.isNaN(parseFloat(v)));
  if (!hasAll) return { tk: null, chu: null };
  const ncc = parseFloat(cc), ngk = parseFloat(gk), nck = parseFloat(ck);
  const tk = Math.round(((ncc*0.2) + (ngk*0.2) + (nck*0.6)) * 100) / 100;
  const chu = letterFrom10(tk);
  return { tk, chu };
}

export function letterFrom10(tk) {
  if (tk === null || tk === undefined) return null;
  if (tk >= 9.0) return 'A+';
  if (tk >= 8.5) return 'A';
  if (tk >= 8.0) return 'B+';
  if (tk >= 7.0) return 'B';
  if (tk >= 6.5) return 'C+';
  if (tk >= 5.5) return 'C';
  if (tk >= 5.0) return 'D+';
  if (tk >= 4.0) return 'D';
  return 'F';
}

export function to4Scale(tk) {
  if (tk === null || tk === undefined) return null;
  if (tk >= 8.5) return 4.0;
  if (tk >= 8.0) return 3.5;
  if (tk >= 7.0) return 3.0;
  if (tk >= 6.5) return 2.5;
  if (tk >= 5.5) return 2.0;
  if (tk >= 5.0) return 1.5;
  if (tk >= 4.0) return 1.0;
  return 0.0;
}

export function classifyGPA10(gpa10) {
  if (gpa10 === null || gpa10 === undefined) return 'Yếu';
  if (gpa10 >= 9.0) return 'Xuất sắc';
  if (gpa10 >= 8.0) return 'Giỏi';
  if (gpa10 >= 6.5) return 'Khá';
  if (gpa10 >= 5.0) return 'Trung bình';
  return 'Yếu';
}
