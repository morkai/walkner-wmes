define(["app/time"],function(t){"use strict";return function(r,u){if(u)return function(r,u,e,o){var s=(u?t.utc:t).getMoment(r),n=s.valueOf(),a=1,f=24/o;for(s.hours()<e&&s.subtract(24,"hours"),s.hours(e).startOf("hours");a<=f;++a){var h=s.valueOf(),i=s.add(o,"hours").valueOf();if(n>=h&&n<i)return{moment:s.subtract(o,"hours").startOf("hour"),no:a,startTime:h,endTime:i,startHour:e,length:o,count:f}}}(r,!!u.utc,"number"==typeof u.startHour?u.startHour:6,u.shiftLength||8);var e=t.getMoment(r),o=e.hour(),s=-1;return o>=6&&o<14?(e.hours(6),s=1):o>=14&&o<22?(e.hours(14),s=2):(e.hours(22),o<6&&e.subtract(1,"days"),s=3),{moment:e.startOf("minute"),shift:s,startHour:6,shiftLength:8}}});