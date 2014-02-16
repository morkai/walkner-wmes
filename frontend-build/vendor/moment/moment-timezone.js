// moment-timezone.js
// version : 0.0.3
// author : Tim Wood
// license : MIT
// github.com/timrwood/moment-timezone

!function(){function e(e){function n(e){e+="";var t=e.split(":"),n=~e.indexOf("-")?-1:1,r=Math.abs(+t[0]),i=parseInt(t[1],10)||0,o=parseInt(t[2],10)||0;return n*(60*r+i+o/60)}function r(e,t,r,i,o,a,s,l,u,d){this.name=e,this.startYear=+t,this.endYear=+r,this.month=+i,this.day=+o,this.dayRule=+a,this.time=n(s),this.timeRule=+l,this.offset=n(u),this.letters=d||"",this.date=c(this.date),this.weekdayAfter=c(this.weekdayAfter),this.lastWeekday=c(this.lastWeekday)}function i(e,t){this.rule=t,this.start=t.start(e)}function o(e,t){return e.isLast?-1:t.isLast?1:t.start-e.start}function a(e){this.name=e,this.rules=[],this.lastYearRule=c(this.lastYearRule)}function s(t,r,i,o,a,s){var l,u="string"==typeof a?a.split("_"):[9999];for(this.name=t,this.offset=n(r),this.ruleSet=i,this.letters=o,this.lastRule=c(this.lastRule),l=0;l<u.length;l++)u[l]=+u[l];this.until=e.utc(u).subtract("m",n(s))}function l(e,t){return e.until-t.until}function u(e){this.name=h(e),this.displayName=e,this.zones=[],this.zoneAndRule=c(this.zoneAndRule,function(e){return+e})}function c(e,t){var n={};return function(r){var i=t?t.apply(this,arguments):r;return i in n?n[i]:n[i]=e.apply(this,arguments)}}function d(e){var t,n,r;for(t in e)for(r=e[t],n=0;n<r.length;n++)p(t+"	"+r[n])}function p(e){if(R[e])return R[e];var t=e.split(/\s/),n=h(t[0]),i=new r(n,t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10]);return R[e]=i,v(n).add(i),i}function h(e){return(e||"").toLowerCase().replace(/\//g,"_")}function f(e){var t,n,r;for(t in e)for(r=e[t],n=0;n<r.length;n++)g(t+"	"+r[n])}function m(e){var t;for(t in e)O[h(t)]=h(e[t])}function g(e){if(k[e])return k[e];var t=e.split(/\s/),n=h(t[0]),r=new s(n,t[1],v(t[2]),t[3],t[4],t[5]);return k[e]=r,y(t[0]).add(r),r}function v(e){return e=h(e),x[e]||(x[e]=new a(e)),x[e]}function y(e){var t=h(e);return O[t]&&(t=O[t]),A[t]||(A[t]=new u(e)),A[t]}function w(e){e&&(e.zones&&f(e.zones),e.rules&&d(e.rules),e.links&&m(e.links))}function b(){var e,t=[];for(e in A)t.push(A[e]);return t}var E,T=e.fn.zoneName,P=e.fn.zoneAbbr,R={},x={},k={},A={},O={},C=1,S=2,D=7,I=8;return r.prototype={contains:function(e){return e>=this.startYear&&e<=this.endYear},start:function(t){return t=Math.min(Math.max(t,this.startYear),this.endYear),e.utc([t,this.month,this.date(t),0,this.time])},date:function(e){return this.dayRule===D?this.day:this.dayRule===I?this.lastWeekday(e):this.weekdayAfter(e)},weekdayAfter:function(t){for(var n=this.day,r=e([t,this.month,1]).day(),i=this.dayRule+1-r;n>i;)i+=7;return i},lastWeekday:function(t){var n=this.day,r=n%7,i=e([t,this.month+1,1]).day(),o=e([t,this.month,1]).daysInMonth(),a=o+(r-(i-1))-7*~~(n/7);return r>=i&&(a-=7),a}},i.prototype={equals:function(e){return e&&e.rule===this.rule?Math.abs(e.start-this.start)<864e5:!1}},a.prototype={add:function(e){this.rules.push(e)},ruleYears:function(e,t){var n,r,a,s=e.year(),l=[];for(n=0;n<this.rules.length;n++)r=this.rules[n],r.contains(s)?l.push(new i(s,r)):r.contains(s+1)&&l.push(new i(s+1,r));return l.push(new i(s-1,this.lastYearRule(s-1))),t&&(a=new i(s-1,t.lastRule()),a.start=t.until.clone().utc(),a.isLast=t.ruleSet!==this,l.push(a)),l.sort(o),l},rule:function(e,t,n){var r,i,o,a,s,l=this.ruleYears(e,n),u=0;for(n&&(i=n.offset+n.lastRule().offset,o=9e4*Math.abs(i)),s=l.length-1;s>-1;s--)a=r,r=l[s],r.equals(a)||(n&&!r.isLast&&Math.abs(r.start-n.until)<=o&&(u+=i-t),r.rule.timeRule===S&&(u=t),r.rule.timeRule!==C&&r.start.add("m",-u),u=r.rule.offset+t);for(s=0;s<l.length;s++)if(r=l[s],e>=r.start&&!r.isLast)return r.rule;return E},lastYearRule:function(e){var t,n,r,i=E,o=-1e30;for(t=0;t<this.rules.length;t++)n=this.rules[t],e>=n.startYear&&(r=n.start(e),r>o&&(o=r,i=n));return i}},s.prototype={rule:function(e,t){return this.ruleSet.rule(e,this.offset,t)},lastRule:function(){return this.rule(this.until)},format:function(e){return this.letters.replace("%s",e.letters)}},u.prototype={zoneAndRule:function(e){var t,n,r;for(e=e.clone().utc(),t=0;t<this.zones.length&&(n=this.zones[t],!(e<n.until));t++)r=n;return[n,n.rule(e,r)]},add:function(e){this.zones.push(e),this.zones.sort(l)},format:function(e){var t=this.zoneAndRule(e);return t[0].format(t[1])},offset:function(e){var t=this.zoneAndRule(e);return-(t[0].offset+t[1].offset)}},e.updateOffset=function(e){var t;e._z&&(t=e._z.offset(e),Math.abs(t)<16&&(t/=60),e.zone(t))},e.fn.tz=function(t){return t?(this._z=y(t),this._z&&e.updateOffset(this),this):this._z?this._z.displayName:void 0},e.fn.zoneName=function(){return this._z?this._z.format(this):T.call(this)},e.fn.zoneAbbr=function(){return this._z?this._z.format(this):P.call(this)},e.tz=function(){var t,n=[],r=arguments.length-1;for(t=0;r>t;t++)n[t]=arguments[t];var i=e.apply(null,n),o=i.zone();return i.tz(arguments[r]),i.add("minutes",i.zone()-o)},e.tz.add=w,e.tz.addRule=p,e.tz.addZone=g,e.tz.zones=b,e.tz.version=t,E=p("- 0 9999 0 0 0 0 0 0"),e}var t="0.0.3";"function"==typeof define&&define.amd?define("moment-timezone",["moment"],e):"undefined"!=typeof window&&window.moment?e(window.moment):"undefined"!=typeof module&&(module.exports=e(require("moment")))}.apply(this);