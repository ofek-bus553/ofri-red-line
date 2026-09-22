// הרכבת הקלה לעופרי - שנקר לכיוון התחנה המרכזית פתח תקווה
// מקור: מתכנן המסלולים של אוטובוס קרוב. מוצגות רק נסיעות R1 שסומנו בזמן אמת.

const FROM = "שנקר::32.092669,34.853254";
const TO = "תחנה מרכזית פתח תקווה::32.094693,34.886538";
const API = "https://api.busnearby.co.il/directions";
const MAX_ROWS = 4;

const query = [
  ["fromPlace", FROM], ["toPlace", TO], ["arriveBy", "false"],
  ["locale", "he"], ["wheelchair", "false"], ["mode", "TRANSIT,WALK"],
  ["showIntermediateStops", "false"], ["numItineraries", "6"],
  ["maxWalkDistance", "600"], ["optimize", "QUICK"],
  ["ignoreRealtimeUpdates", "false"]
].map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");

const widget = new ListWidget();
widget.backgroundColor = new Color("#8B1020");
widget.setPadding(14, 14, 12, 14);
widget.url = `scriptable:///run?scriptName=${encodeURIComponent(Script.name())}`;

function text(value, size, color="#FFFFFF", bold=false) {
  const t = widget.addText(value);
  t.font = bold ? Font.boldSystemFont(size) : Font.systemFont(size);
  t.textColor = new Color(color); t.rightAlignText();
  t.lineLimit = 1; t.minimumScaleFactor = 0.68; return t;
}
function hhmm(ms) {
  return new Intl.DateTimeFormat("he-IL", {hour:"2-digit", minute:"2-digit", hour12:false, timeZone:"Asia/Jerusalem"}).format(new Date(ms));
}

text("R1 · הרכבת הקלה", 20, "#FFFFFF", true);
text("שנקר ← תחנה מרכזית פתח תקווה", 12, "#FFD9DE");
widget.addSpacer(7);

const now = Date.now();
try {
  const req = new Request(`${API}?${query}`);
  req.headers = {"Accept":"application/json"};
  req.timeoutInterval = 12;
  const data = await req.loadJSON();
  const itineraries = data?.plan?.itineraries || [];
  const arrivals = itineraries.map(it => {
    const leg = (it.legs || []).find(l => l.mode === "TRAM" && String(l.route) === "R1" && l.from?.stopCode === "36309" && l.to?.stopCode === "36496");
    return leg && leg.realTime === true ? {at:leg.startTime, trip:leg.tripId || String(leg.startTime)} : null;
  }).filter(Boolean).filter(x => x.at >= now - 60000 && x.at <= now + 45*60000)
    .sort((a,b) => a.at-b.at)
    .filter((x,i,a) => a.findIndex(y => y.trip===x.trip)===i)
    .slice(0, MAX_ROWS);

  if (!arrivals.length) {
    const e=text("אין כרגע דיווחים חיים", 15, "#FFE082", true); e.lineLimit=2;
  } else {
    for (const a of arrivals) {
      const mins=Math.max(0,Math.ceil((a.at-now)/60000));
      const row=widget.addStack(); row.layoutHorizontally(); row.centerAlignContent();
      const live=row.addText("חי"); live.font=Font.boldSystemFont(11); live.textColor=new Color("#FFCED5");
      row.addSpacer();
      const clock=row.addText(hhmm(a.at)); clock.font=Font.systemFont(13); clock.textColor=new Color("#FFFFFF");
      row.addSpacer();
      const eta=row.addText(mins===0?"עכשיו":`${mins} דק׳`); eta.font=Font.boldSystemFont(16); eta.textColor=new Color(mins<=5?"#8FF0B8":"#FFFFFF");
      widget.addSpacer(5);
    }
  }
} catch(e) {
  const f=text("לא הצלחנו לקבל זמני רכבת", 14, "#FFC1C1", true); f.lineLimit=2;
  text("לחצי על הווידג׳ט כדי לנסות שוב", 11, "#FFD9DE");
}
widget.addSpacer();
text(`עודכן ${hhmm(Date.now())} · לחיצה לרענון`, 10, "#E8AEB7");
widget.refreshAfterDate = new Date(Date.now()+5*60*1000);
if(config.runsInWidget) Script.setWidget(widget); else await widget.presentMedium();
Script.complete();
