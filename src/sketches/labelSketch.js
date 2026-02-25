export default function labelSketch(p) {
  // ---------------------------------------------------------------------------
  // KONSTANTER — de nemmeste ting at lege med
  // ---------------------------------------------------------------------------

  let ibu = 5.0;
  let abv = 5.0;
  let antal_kurver = 7; // Antal kurver i mønsteret.
  let snitprocent = 0.49; // Hvor langt inde på kanten vi skærer
  const antal_glatninger = 6; // Hvor mange gange vi glatter kurven.

  let curves = [];
  let baggrundFarve = "#6e7174";

  // ===========================================================================
  // FUNKTION: chaikin_cut(a, b, ratio)
  // ===========================================================================

  // Foreksempel:
  //   A ———————————————— B
  // Med ratio=0.25 skærer vi ved 25% fra A og 25% fra B:
  //   A ——[n0]————————[n1]—— B

  function chaikin_cut(a, b, kantSnit) {
    if (kantSnit > 0.5) kantSnit = 1 - kantSnit;

    const points = [];

    points.push(
      p.createVector(
        p.lerp(a.x, b.x, kantSnit), // find x: x% af vejen vandret fra A til B
        p.lerp(a.y, b.y, kantSnit), // find y: x% af vejen lodret fra A til B
      ),
    );

    points.push(
      p.createVector(
        p.lerp(b.x, a.x, kantSnit), // find x: x% af vejen vandret fra B til A
        p.lerp(b.y, a.y, kantSnit), // find y: x% af vejen lodret fra B til A
      ),
    );

    // Returner listen med de to nye punkter
    return points;
  }

  // ===========================================================================
  // FUNKTION: chaikin(pts, ratio, iterations, close)
  // ===========================================================================

  function chaikin(points, kantSnit, antal_glatninger, close) {
    if (antal_glatninger == 0) {
      return points;
    }

    const new_points = [];

    let antal_kanter;
    if (close == true) {
      antal_kanter = points.length;
    } else {
      antal_kanter = points.length - 1;
    }

    //i = tæller
    for (let i = 0; i < antal_kanter; i++) {
      const startpunktA = points[i]; //a
      const slutpunktB = points[(i + 1) % points.length]; //b (% points.length tager os tilbage til starten af i som er vores talrække)
      const nyePunkter = chaikin_cut(startpunktA, slutpunktB, kantSnit); //n

      if (!close && i == 0) {
        new_points.push(startpunktA);
        new_points.push(nyePunkter[1]);
      } else if (!close && i == antal_kanter - 1) {
        new_points.push(nyePunkter[0]);
        new_points.push(slutpunktB);
      } else {
        new_points.push(nyePunkter[0]);
        new_points.push(nyePunkter[1]);
      }
    }
    return chaikin(new_points, kantSnit, antal_glatninger - 1, close);
  }

  function generateCurves() {
    curves = []; //nulstiller listen af kurver, så vi kan generere nye

    const w = p.width;
    const h = p.height;

    for (let i = 0; i < antal_kurver; i++) {
      const t = i / (antal_kurver - 1);
      const numCrtl = p.floor(p.random(4, 8));
      // numCtrl — Det er en forkortelse for "number of control points"
      // = antal kontrolpunkter. Det er det antal punkter kurven skal bygges ud fra
      // floor = afrunder nedad til nærmeste heltal.
      const rawPoints = [];

      rawPoints.push(p.createVector(0, t * h + p.random(-h * 0.15, h * 0.15))); //rawPoints.push(p.createVector(x, y, * h + p.random(tildels tilfældig variation i højden*));));

      for (let j = 1; j < numCrtl - 1; j++) {
        const tx = (j / (numCrtl - 1)) * w;
        const ty = t * h + p.random(-h * 0.35, h * 0.35);

        rawPoints.push(p.createVector(tx, ty));
      }
      rawPoints.push(p.createVector(w, t * h + p.random(-h * 0.15, h * 0.15)));

      const smoothed = chaikin(rawPoints, snitprocent, antal_glatninger, false);

      curves.push(smoothed);
    }
  }
  // =============================================================
  // Opsætning af canvas'et og genererer kurverne for første gang.
  // =============================================================

  p.setup = function () {
    const mountBeholder = document.getElementById("p5-mount");

    //fallback-værdier (på canvas størrelse) hvis mountBeholder ikke findes
    const w = mountBeholder.offsetWidth || 1900;
    const h = mountBeholder.offsetHeight || 1416;
    const canvas = p.createCanvas(w, h);

    canvas.parent("p5-mount");
    p.randomSeed(666);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    generateCurves();
    p.noLoop();
  };

  p.draw = function () {
    p.background(baggrundFarve);
    p.noFill();
    p.strokeCap(p.ROUND);
    p.strokeJoin(p.ROUND);

    for (let ci = 0; ci < curves.length; ci++) {
      const points = curves[ci];

      if (points.length < 2) continue;

      const lerpT = ci / (curves.length - 1);
      const alpha = p.map(lerpT, 0, 1, 30, 90); //Disse tal kan ændres (gennemsigtigheden)
      const weight = p.map(lerpT, 0, 1, 1, 20); //Disse tal kan ændres (linjetykkelsen)

      let stregfarve = p.color(
        (p.hue(baggrundFarve) + 180) % 360,
        p.saturation(baggrundFarve),
        p.brightness(baggrundFarve),
        alpha,
      );
      p.stroke(stregfarve);
      p.strokeWeight(weight);

      p.beginShape();
      for (const punkt of points) {
        p.vertex(punkt.x, punkt.y);
      }
      p.endShape();
    }
  };
  // ===========================================================================
  // p.windowResized() — kører automatisk hvis browservinduet ændrer størrelse
  // ===========================================================================

  p.windowResized = function () {
    const beholder = document.getElementById("p5-mount");
    p.resizeCanvas(beholder.offsetWidth, beholder.offsetHeight);

    p.randomSeed(42);
    generateCurves();
    p.redraw();
  };
  p.opdaterSnit = function (ibu) {
    snitprocent = p.map(ibu, 0, 100, 0.25, 0.05);
    p.randomSeed(666);
    generateCurves();
    p.redraw();
  };

  p.opdaterBaggrund = function (hex) {
    baggrundFarve = hex;
    p.redraw();
  };

  p.opdaterHue = function (hue) {
    baggrundFarve = p.color(hue, 50, 90);
    p.redraw();
  };

  p.opdaterKurver = function (abv) {
    antal_kurver = p.map(abv, 0, 16, 7, 30);
    p.randomSeed(666);
    generateCurves();
    p.redraw();
  };
}
