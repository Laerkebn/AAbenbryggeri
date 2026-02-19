// =============================================================================
// labelSketch.js
// =============================================================================
// Dette er en p5.js sketch skrevet i "instance mode".
// Det betyder at hele sketch'en er pakket ind i én funktion der eksporteres,
// så Astro kan importere og bruge den uden at den kolliderer med resten af siden.
// Tænk på det som en selvstændig tegneopskrift som p5.js læser og udfører.
// =============================================================================


// "export default" gør at andre filer (som P5Sketch.astro) kan importere denne funktion.
// "function labelSketch" er bare et navn vi har valgt, det kunne hedde hvad som helst.
// "(p)" er det vigtigste argument: når p5.js starter sketch'en, sender den sig selv
// ind som "p". Derefter skriver vi p.createCanvas, p.background, p.vertex osv.
// — altså alle p5-kommandoer får "p." foran sig.
export default function labelSketch(p) {


  // ---------------------------------------------------------------------------
  // KONSTANTER — de nemmeste ting at lege med
  // ---------------------------------------------------------------------------

  const NUM_CURVES = 18;  // Antal kurver i mønsteret. Prøv 30 for et tættere mønster.
  const RATIO = 0.25;     // Hvor langt inde på kanten vi skærer (0.25 = 25% fra hver ende).
  const ITERATIONS = 5;   // Hvor mange gange vi glatter kurven. Flere = blødere kurver.


  let curves = [];


  function chaikin_cut(a, b, ratio) {


    if (ratio > 0.5) ratio = 1 - ratio;

    const pts = [];

    pts.push(p.createVector(
      p.lerp(a.x, b.x, ratio),
      p.lerp(a.y, b.y, ratio)
    ));

    pts.push(p.createVector(
      p.lerp(b.x, a.x, ratio),
      p.lerp(b.y, a.y, ratio)
    ));

    // Returner listen med de to nye punkter
    return pts;
  }

// ===========================================================================
  // FUNKTION: chaikin(pts, ratio, iterations, close)
  // ===========================================================================

  function chaikin(pts, ratio, iterations, close) {

    // Stoppunktet for rekursionen.
    // Hvis vi har kørt nok gange, returnerer vi punkterne som de er.
    if (iterations === 0) return pts;

    // Tom liste til næste generation af punkter
    const next = [];

    // Hvor mange kanter skal vi behandle?
    // For en LUKKET form (polygon/cirkel) behandler vi alle kanter,
    // inklusiv den der går fra det sidste punkt tilbage til det første.
    // For en ÅBEN form (linje) springer vi den kant over.
    const num_corners = close ? pts.length : pts.length - 1;

    // Løb igennem alle kanter én ad gangen
    for (let i = 0; i < num_corners; i++) {

      // Hent det i'te punkt (A) og det næste punkt (B)
      const a = pts[i];

      // "(i + 1) % pts.length" er en smart måde at "wrappe rundt":
      // når i er ved det SIDSTE indeks, går % tilbage til 0 (det første punkt).
      // Det er nødvendigt for lukkede former.
      const b = pts[(i + 1) % pts.length];

      // Skær de to nye punkter ud af kanten A→B
      const n = chaikin_cut(a, b, ratio);

      // Nu håndterer vi en særlig situation for ÅBNE kurver:
      // Det første og sidste punkt må IKKE rykkes — ellers ville kurven
      // krympe indad for hver iteration og aldrig ramme sine endepunkter.

      if (!close && i === 0) {
        // Første kant i en åben kurve:
        // Behold A som den er, tilføj kun det inderste af de to nye punkter.
        next.push(a);
        next.push(n[1]);

      } else if (!close && i === num_corners - 1) {
        // Sidste kant i en åben kurve:
        // Tilføj det inderste punkt, og behold B som den er.
        next.push(n[0]);
        next.push(b);

      } else {
        // Alle andre kanter (indre kanter i åbne kurver, eller alle kanter i lukkede):
        // Tilføj begge de nye punkter og smid A og B væk.
        next.push(n[0]);
        next.push(n[1]);
      }
    }

    // Kald funktionen igen med de nye punkter, men med én iteration færre.
    // Det er rekursionen — funktionen kalder sig selv!
    return chaikin(next, ratio, iterations - 1, close);
  }


  // ===========================================================================
  // FUNKTION: generateCurves()
  // ===========================================================================
  // Her bygger vi selve mønsteret.
  // Vi genererer NUM_CURVES kurver der strækker sig fra venstre til højre kant.
  // Hver kurve har tilfældige kontrolpunkter der giver den dens organiske form.
  // Til sidst glatter vi dem med Chaikin-algoritmen.
  // ===========================================================================

  function generateCurves() {

    // Nulstil listen — vigtig hvis vi regenererer ved resize
    curves = [];

    const w = p.width;   // Canvas-bredden i pixels
    const h = p.height;  // Canvas-højden i pixels

    // Lav én kurve ad gangen
    for (let i = 0; i < NUM_CURVES; i++) {

      // "t" er et tal fra 0 til 1 der fortæller hvor langt nede på canvas'et
      // denne kurve skal ligge. Første kurve: t=0 (top). Sidste kurve: t=1 (bund).
      const t = (i / (NUM_CURVES - 1));

      // Hver kurve får tilfældigt 4-7 kontrolpunkter.
      // Flere kontrolpunkter = mere slynget kurve.
      // "p.floor()" runder ned til et helt tal (vi kan ikke have 5.7 punkter).
      // "p.random(4, 8)" giver et tilfældigt tal mellem 4 og 8.
      const numCtrl = p.floor(p.random(4, 8));

      // Tom liste til de rå kontrolpunkter (før Chaikin-glattning)
      const rawPts = [];

      // --- STARTPUNKT (venstre kant, x=0) ---
      // Højden er t*h (kurveens "base-højde") plus lidt tilfældig variation.
      // "p.random(-h * 0.15, h * 0.15)" giver op til ±15% af canvas-højden i variation.
      rawPts.push(p.createVector(
        0,
        t * h + p.random(-h * 0.15, h * 0.15)
      ));

      // --- MIDTERPUNKTER (spredt vandret over canvas'et) ---
      // Vi starter ved j=1 og slutter ved numCtrl-2 for at undgå at overskrive
      // start- og slutpunktet.
      for (let j = 1; j < numCtrl - 1; j++) {

        // Vandret position: jævnt fordelt fra venstre til højre
        const tx = (j / (numCtrl - 1)) * w;

        // Lodret position: kurveens base-højde plus stor tilfældig variation.
        // "±35% af canvas-højden" giver de bølgende, organiske kurver.
        const ty = t * h + p.random(-h * 0.35, h * 0.35);

        rawPts.push(p.createVector(tx, ty));
      }

      // --- SLUTPUNKT (højre kant, x=w) ---
      // Samme logik som startpunktet, bare på højre side.
      rawPts.push(p.createVector(
        w,
        t * h + p.random(-h * 0.15, h * 0.15)
      ));

      // --- CHAIKIN-GLATTNING ---
      // Nu sender vi de rå kontrolpunkter gennem Chaikin-algoritmen.
      // "false" = åben kurve (starter og slutter uden at forbinde sig selv).
      const smoothed = chaikin(rawPts, RATIO, ITERATIONS, false);

      // Gem den færdige, glattede kurve i vores liste
      curves.push(smoothed);
    }
  }


  // ===========================================================================
  // p.setup() — kører KUN ÉN gang når sketch'en starter
  // ===========================================================================
  // Her opsætter vi canvas'et og genererer kurverne for første gang.
  // ===========================================================================

  p.setup = function () {

    // Find den div i HTML'en som canvas'et skal leve inde i.
    // Den har id="p5-mount" i P5Sketch.astro.
    const mount = document.getElementById('p5-mount');

    // Canvas'et bliver samme størrelse som div'en.
    // "|| 1900" og "|| 1416" er fallback-værdier hvis div'en har størrelse 0.
    const w = mount.offsetWidth || 1900;
    const h = mount.offsetHeight || 1416;

    // Lav selve canvas'et i den størrelse
    const canvas = p.createCanvas(w, h);

    // Placér canvas'et inde i vores div (ikke bare flydende rundt på siden)
    canvas.parent('p5-mount');

    // Sæt et fast "frø" til tilfældighedsgeneratoren.
    // Tallet 42 er vilkårligt, men ved at sætte et fast tal sikrer vi at
    // mønsteret ser ENS UD HVER GANG siden indlæses.
    // Uden dette ville kurverne se anderledes ud ved hvert refresh.
    p.randomSeed(42);

    // Generer alle kurver
    generateCurves();

    // Fortæl p5 at draw() kun skal køre ÉN GANG.
    // Da mønsteret er statisk, er der ingen grund til at gentegne det
    // 60 gange i sekundet som p5 ellers ville gøre.
    p.noLoop();
  };


  // ===========================================================================
  // p.draw() — kører normalt 60 gange i sekundet, men vi har sat noLoop()
  //            så den kun kører én enkelt gang.
  // ===========================================================================
  // Her tegner vi alle kurverne på canvas'et.
  // ===========================================================================

  p.draw = function () {

    // Fyld canvas'et med den grå baggrundsfarve.
    // Farven "#6e7174" matcher label-baggrunden i index.astro.
    p.background('#6e7174');

    // Kurverne skal ikke have en fyldfarve indeni — kun en kontur/streg.
    p.noFill();

    // Gør at linjernes ender og hjørner er RUNDE i stedet for firkantede.
    // Giver et blødere, mere organisk udseende.
    p.strokeCap(p.ROUND);
    p.strokeJoin(p.ROUND);

    // Tegn én kurve ad gangen
    for (let ci = 0; ci < curves.length; ci++) {
      const pts = curves[ci];

      // Hvis en kurve af en eller anden grund kun har ét punkt (eller nul),
      // kan vi ikke tegne en linje — spring den over.
      if (pts.length < 2) continue;

      // "lerpT" er et tal fra 0 til 1 baseret på kurvenummeret.
      // Bruges til at variere udseendet gradvist fra første til sidste kurve.
      const lerpT = ci / (curves.length - 1);

      // "p.map(lerpT, 0, 1, 30, 90)" konverterer lerpT (0→1) til et nyt interval (30→90).
      // Den første kurve får alpha=30 (meget gennemsigtig/lys).
      // Den sidste kurve får alpha=90 (mere synlig/tyk).
      const alpha = p.map(lerpT, 0, 1, 30, 90);

      // Samme princip for linjetykkelsen:
      // Første kurve er meget tynd (0.8px), sidste er tykkere (3.5px).
      const weight = p.map(lerpT, 0, 1, 0.8, 3.5);

      // Sæt farven til HVID (255, 255, 255) med den beregnede gennemsigtighed.
      // Alpha går fra 0 (usynlig) til 255 (helt uigennemsigtig).
      p.stroke(255, 255, 255, alpha);

      // Sæt linjetykkelsen
      p.strokeWeight(weight);

      // Tegn kurven:
      // beginShape() starter en frihåndsform.
      // vertex() tilføjer hvert punkt som et hjørnepunkt i formen.
      // endShape() afslutter og tegner formen (uden at lukke den).
      p.beginShape();
      for (const pt of pts) {
        p.vertex(pt.x, pt.y);
      }
      p.endShape();
    }
  };


  // ===========================================================================
  // p.windowResized() — kører automatisk hvis browservinduet ændrer størrelse
  // ===========================================================================

  p.windowResized = function () {

    // Find div'en igen og tilpas canvas'et til den nye størrelse
    const mount = document.getElementById('p5-mount');
    p.resizeCanvas(mount.offsetWidth, mount.offsetHeight);

    // Generer kurverne forfra med samme seed (så de ser ens ud som før)
    p.randomSeed(42);
    generateCurves();

    // Tegn én gang til med den nye størrelse
    p.redraw();
  };

} // <- Her slutter labelSketch-funktionen