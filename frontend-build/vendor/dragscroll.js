/**
 * @fileoverview dragscroll - scroll area by dragging
 * @version 0.0.5
 *
 * @license MIT, see http://github.com/asvd/intence
 * @copyright 2015 asvd <heliosframework@gmail.com>
 */

!function(e,n){"function"==typeof define&&define.amd?define(["exports"],n):n("undefined"!=typeof exports?exports:e.dragscroll={})}(this,function(e){var n=window,t=document,o="mousemove",c="mouseup",r="mousedown",i="EventListener",s="add"+i,f="remove"+i,l=[],u=function(){var e,t;for(e=0;e<l.length;)t=l[e++],t[f](r,t.md,0),n[f](c,t.mu,0),n[f](o,t.mm,0)},a=function(e){e||(e={}),e.accept||(e.accept=function(){return!0}),u(),l=t.getElementsByClassName(e.selector||"dragscroll");for(var i=0;i<l.length;)!function(t,i,f,l){t[s](r,t.md=function(n){e.accept(n)&&(l=1,i=n.clientX,f=n.clientY,n.preventDefault(),e.stopPropagation!==!1&&n.stopPropagation())},0),n[s](c,t.mu=function(){l=0},0),n[s](o,t.mm=function(e,n){n=t.scroller||t,l&&(n.scrollLeft-=-i+(i=e.clientX),n.scrollTop-=-f+(f=e.clientY))},0)}(l[i++])};e.destroy=u,e.reset=a});