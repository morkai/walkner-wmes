!function(e,n){"function"==typeof define&&define.amd?define(["exports"],n):"undefined"!=typeof exports?n(exports):n(e.dragscroll={})}(this,function(e){var n=window,t=document,o=[],r=function(){var e,t;for(e=0;e<o.length;)(t=o[e++]).removeEventListener("mousedown",t.md,0),n.removeEventListener("mouseup",t.mu,0),n.removeEventListener("mousemove",t.mm,0)};e.destroy=r,e.reset=function(e){e||(e={}),e.accept||(e.accept=function(){return!0}),r(),o=t.getElementsByClassName(e.selector||"dragscroll");for(var s=0;s<o.length;)!function(t,o,r,s){t.addEventListener("mousedown",t.md=function(n){e.accept(n)&&(s=1,o=n.clientX,r=n.clientY,n.preventDefault(),!1!==e.stopPropagation&&n.stopPropagation())},0),n.addEventListener("mouseup",t.mu=function(){s=0},0),n.addEventListener("mousemove",t.mm=function(e,n){n=t.scroller||t,s&&(n.scrollLeft-=-o+(o=e.clientX),n.scrollTop-=-r+(r=e.clientY))},0)}(o[s++])}});