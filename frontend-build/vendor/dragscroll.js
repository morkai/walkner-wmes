/**
 * @fileoverview dragscroll - scroll area by dragging
 * @version 0.0.5
 *
 * @license MIT, see http://github.com/asvd/intence
 * @copyright 2015 asvd <heliosframework@gmail.com>
 */

!function(e,n){"function"==typeof define&&define.amd?define(["exports"],n):n("undefined"!=typeof exports?exports:e.dragscroll={})}(this,function(e){var n=window,t=document,o="mousemove",c="mouseup",r="mousedown",i="EventListener",l="add"+i,s="remove"+i,f=[],u=function(e){e||(e={}),e.accept||(e.accept=function(){return!0});var i,u;for(i=0;i<f.length;)u=f[i++],u[s](r,u.md,0),n[s](c,u.mu,0),n[s](o,u.mm,0);for(f=t.getElementsByClassName(e.selector||"dragscroll"),i=0;i<f.length;)!function(t,i,s,f){t[l](r,t.md=function(n){e.accept(n)&&(f=1,i=n.clientX,s=n.clientY,n.preventDefault(),e.stopPropagation!==!1&&n.stopPropagation())},0),n[l](c,t.mu=function(){f=0},0),n[l](o,t.mm=function(e,n){n=t.scroller||t,f&&(n.scrollLeft-=-i+(i=e.clientX),n.scrollTop-=-s+(s=e.clientY))},0)}(f[i++])};e.reset=u});