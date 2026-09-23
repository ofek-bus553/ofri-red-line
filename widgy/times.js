// הרכבת הקלה לעופרי - Widgy - זמני R1 משנקר לכיוון התחנה המרכזית פתח תקווה
// ב-Widgy: שכבת טקסט > Data > JavaScript > Script. להדביק הכול כמו שהוא.
// מקור: מתכנן המסלולים של אוטובוס קרוב. מוצגות רק נסיעות R1 שסומנו בזמן אמת.
var main = function() {
  var FROM = "שנקר::32.092669,34.853254";
  var TO = "תחנה מרכזית פתח תקווה::32.094693,34.886538";
  var API = "https://api.busnearby.co.il/directions";
  var MAX_ROWS = 4;
  var params = [
    ["fromPlace", FROM], ["toPlace", TO], ["arriveBy", "false"],
    ["locale", "he"], ["wheelchair", "false"], ["mode", "TRANSIT,WALK"],
    ["showIntermediateStops", "false"], ["numItineraries", "6"],
    ["maxWalkDistance", "600"], ["optimize", "QUICK"],
    ["ignoreRealtimeUpdates", "false"]
  ];
  var query = params.map(function(p) {
    return encodeURIComponent(p[0]) + "=" + encodeURIComponent(p[1]);
  }).join("&");
  var hhmm = function(ms) {
    try {
      return new Intl.DateTimeFormat("he-IL", {hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jerusalem"}).format(new Date(ms));
    } catch (e) {
      var d = new Date(ms);
      return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    }
  };
  var now = Date.now();
  try {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", API + "?" + query, false);
    xhr.send(null);
    if (xhr.status < 200 || xhr.status >= 300) throw new Error("HTTP " + xhr.status);
    var data = JSON.parse(xhr.responseText);
    var its = (data && data.plan && data.plan.itineraries) || [];
    var seen = {};
    var arrivals = [];
    its.forEach(function(it) {
      var leg = (it.legs || []).filter(function(l) {
        return l.mode === "TRAM" && String(l.route) === "R1" && l.from && l.from.stopCode === "36309" && l.to && l.to.stopCode === "36496";
      })[0];
      if (!leg || leg.realTime !== true) return;
      if (leg.startTime < now - 60000 || leg.startTime > now + 45 * 60000) return;
      arrivals.push({at: leg.startTime, trip: leg.tripId || String(leg.startTime)});
    });
    arrivals.sort(function(a, b) { return a.at - b.at; });
    arrivals = arrivals.filter(function(x) {
      if (seen[x.trip]) return false;
      seen[x.trip] = true;
      return true;
    }).slice(0, MAX_ROWS);
    if (!arrivals.length) return "אין כרגע דיווחים חיים";
    return arrivals.map(function(a) {
      var mins = Math.max(0, Math.ceil((a.at - now) / 60000));
      return "חי   " + hhmm(a.at) + "   " + (mins === 0 ? "עכשיו" : mins + " דק׳");
    }).join("\n");
  } catch (e) {
    return "לא הצלחנו לקבל זמני רכבת\nלחצי על הווידג׳ט כדי לנסות שוב";
  }
};
