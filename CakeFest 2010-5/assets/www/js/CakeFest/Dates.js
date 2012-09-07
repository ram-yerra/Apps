// Event start time
CakeFest.Dates.Start = new Date();
CakeFest.Dates.Start.setUTCFullYear(2010, 8, 2);
CakeFest.Dates.Start.setUTCHours(8, 0, 0, 0);

// Event finish time
CakeFest.Dates.Finish = new Date();
CakeFest.Dates.Finish.setUTCFullYear(2010, 8, 5);
CakeFest.Dates.Finish.setUTCHours(17, 0, 0, 0);

// Client's GMT Offset
var now = new Date();
CakeFest.Dates.Offset = now.getTimezoneOffset();
now = null;