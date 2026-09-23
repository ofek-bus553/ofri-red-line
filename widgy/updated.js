// הרכבת הקלה לעופרי - Widgy - שורת "עודכן"
// ב-Widgy: שכבת טקסט > Data > JavaScript > Script. להדביק הכול כמו שהוא.
var main = function() {
  var t;
  try {
    t = new Intl.DateTimeFormat("he-IL", {hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jerusalem"}).format(new Date());
  } catch (e) {
    var d = new Date();
    t = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }
  return "עודכן " + t + " · לחיצה לרענון";
};
