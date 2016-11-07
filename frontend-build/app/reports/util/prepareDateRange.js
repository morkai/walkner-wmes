// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/time"],function(e){"use strict";return function(t,a){var r,s="string"==typeof t?t:t.getAttribute("data-range"),c=e.getMoment().minutes(0).seconds(0).milliseconds(0),n="day",o=c.hours();switch(a&&c.hours(6),s){case"currentYear":c.month(0).date(1),r=c.clone().add(1,"years"),n="year";break;case"prevYear":c.month(0).date(1).subtract(1,"years"),r=c.clone().add(1,"years"),n="year";break;case"currentQuarter":c.startOf("quarter"),r=c.clone().add(1,"quarter"),n="month";break;case"q1":case"q2":case"q3":case"q4":c.quarter(+s.substr(1)).startOf("quarter"),r=c.clone().add(3,"months"),n="month";break;case"currentMonth":c.date(1),r=c.clone().add(1,"months");break;case"prevMonth":c.date(1).subtract(1,"months"),r=c.clone().add(1,"months");break;case"currentWeek":c.weekday(0),r=c.clone().add(7,"days");break;case"prevWeek":c.weekday(0).subtract(7,"days"),r=c.clone().add(7,"days");break;case"today":r=c.clone().add(1,"days"),a&&(n="shift");break;case"yesterday":r=c.clone(),c.subtract(1,"days"),a&&(n="shift");break;case"currentShift":case"prevShift":o>=6&&14>o?c.hours(6):o>=14&&22>o?c.hours(14):(c.hours(22),6>o&&c.subtract(1,"days")),r=c.clone().add(8,"hours"),n="hour","prevShift"===s&&(c.subtract(8,"hours"),r.subtract(8,"hours"))}if(t.getAttribute){var d=t.getAttribute("data-interval");d&&(n=d)}return{fromMoment:c,toMoment:r,interval:n}}});