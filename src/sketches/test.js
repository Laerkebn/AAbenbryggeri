// Hjælpefunktion: { h, s, l } → [r, g, b] (0-255)
function hslToRgb(h, s, l) {

  // ─────────────────────────────────────────
  // TRIN 1: Skalér tallene ned til 0-1
  // Vi får h i grader (0-360) og s/l i procent (0-100)
  // men vores formler forventer tal mellem 0 og 1
  // ─────────────────────────────────────────

  h = h / 360;
  s = s / 100;
  l = l / 100;


  // ─────────────────────────────────────────
  // TRIN 2: Er farven grå?
  // Hvis mætningen er 0 er alle kanaler ens
  // og vi sætter dem alle til lysheden
  // ─────────────────────────────────────────

  let r;
  let g;
  let b;

  if (s === 0) {
    r = l;
    g = l;
    b = l;

  } else {

    // ─────────────────────────────────────────
    // TRIN 3: Udregn q og pr
    // Dette er to hjælpetal som bruges til
    // at beregne de tre farvekanaler bagefter
    //
    // q er den "lyse grænse" — det højeste
    // en farvekanal kan blive
    //
    // pr er den "mørke grænse" — det laveste
    // en farvekanal kan blive
    // ─────────────────────────────────────────

    let q;

    if (l < 0.5) {
      // mørk halvdel — blandes med sort
      q = l * (1 + s);
    } else {
      // lys halvdel — blandes med hvid
      q = l + s - l * s;
    }

    let pr = 2 * l - q;


    // ─────────────────────────────────────────
    // TRIN 4: Hjælpefunktion — hue2rgb
    // Denne funktion finder ud af hvor stærk
    // én farvekanal er på et bestemt sted på
    // farvehjulet
    //
    // p = mørk grænse
    // q = lys grænse
    // t = hvor på farvehjulet vi kigger
    // ─────────────────────────────────────────

    function hue2rgb(p, q, t) {

      // Hvis t er udenfor 0-1 bringer vi det tilbage
      // Farvehjulet er rundt — går man forbi 1 starter man forfra
      if (t < 0) {
        t = t + 1;
      }
      if (t > 1) {
        t = t - 1;
      }

      // Farvehjulet er delt i 6 zoner
      // Hver zone beregner farven lidt forskelligt

      if (t < 1/6) {
        // Zone 1: farven stiger hurtigt op mod lys grænse
        return p + (q - p) * 6 * t;
      }

      if (t < 1/2) {
        // Zone 2: farven er på sit højeste (lys grænse)
        return q;
      }

      if (t < 2/3) {
        // Zone 3: farven falder tilbage ned mod mørk grænse
        return p + (q - p) * (2/3 - t) * 6;
      }

      // Zone 4: farven er på sit laveste (mørk grænse)
      return p;
    }


    // ─────────────────────────────────────────
    // TRIN 5: Beregn de tre farvekanaler
    // Vi kalder hue2rgb tre gange — én for hver kanal
    // Hver kanal starter et forskelligt sted på farvehjulet
    // Rød starter 1/3 før, blå starter 1/3 efter
    // ─────────────────────────────────────────

    r = hue2rgb(pr, q, h + 1/3);  // rød er 120° foran
    g = hue2rgb(pr, q, h);         // grøn er midt på
    b = hue2rgb(pr, q, h - 1/3);  // blå er 120° bagved


  }


  // ─────────────────────────────────────────
  // TRIN 6: Skalér op fra 0-1 til 0-255
  // og afrund til nærmeste heltal
  // ─────────────────────────────────────────

  let rodKanal = Math.round(r * 255);
  let groenKanal = Math.round(g * 255);
  let blaaKanal = Math.round(b * 255);