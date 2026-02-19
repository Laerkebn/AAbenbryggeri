export default function labelSketch(p) {


// ---------------------------------------------------------------------------
// KONSTANTER — de nemmeste ting at lege med
// ---------------------------------------------------------------------------

const antal_kurver = 18; // Antal kurver i mønsteret.
const snitprocent = 0.25; // Hvor langt inde på kanten vi skærer
const antal_glatninger = 5; // Hvor mange gange vi glatter kurven.

let curves = [];


// ===========================================================================
// FUNKTION: chaikin_cut(a, b, ratio)
// ===========================================================================

// Foreksempel:
//   A ———————————————— B
// Med ratio=0.25 skærer vi ved 25% fra A og 25% fra B:
//   A ——[n0]————————[n1]—— B

function chaikin_cut(a,b,ratio) {
    if (ratio > 0.5) ratio = 1 - ratio; 
}

const points = [];

points.push(p.createVector(
p.lerp(a.x, b.x, ratio),  // find x: x% af vejen vandret fra A til B
p.lerp(a.y, b.y, ratio)  // find y: x% af vejen lodret fra A til B
));

points.push(p.createVector(
p.lerp(b.x, a.x, ratio), // find x: x% af vejen vandret fra B til A
p.lerp(b.y, a.y, ratio) // find y: x% af vejen lodret fra B til A 
));

    // Returner listen med de to nye punkter
    return points;
  }

  // ===========================================================================
  // FUNKTION: chaikin(pts, ratio, iterations, close)
  // ===========================================================================

  function chaikin(points, snitprocent, antal_glatninger, close) {
    if (antal_glatninger == 0) { return points; }

    const new_points = [];
    let antal_kanter;

    if (close == true) {
        antal_kanter = points.length;
       }  else {
        antal_kanter = points.length - 1;
    }
    
    //i = tæller
    for (let i = 0; i < antal_kanter; i++) {

        const startpunktA = points[i];
        const startpunktB = points[(i + 1) % points.length];
        
  }
  }