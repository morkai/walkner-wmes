define(["d3"],function(t){return t.timeline=function(){function n(n){function e(t,n){return v.left+(t.starting_time-x)*D}function F(){if(g||N.attr("height"))g?N.attr("height",g):g=N.attr("height");else{if(!B)throw"height of the timeline is not set";g=G.height+G.top-E.top,t.select(n[0][0]).attr("height",g)}}function A(){if(!s&&!E.width)throw"width of the timeline is not set. As of Firefox 27, timeline().with(x) needs to be explicitly set in order to render";s&&E.width||(s?N.attr("width",s):s=N.attr("width"))}var C=n.append("g"),E=n[0][0].getBoundingClientRect(),N=t.select(n[0][0]),O={},R=1,S=0,j=0;A(),(y||0==k&&0==x)&&(C.each(function(t,n){t.forEach(function(t,n){y&&Object.keys(O).indexOf(n)==-1&&(O[n]=R,R++),0==k&&0==x&&t.times.forEach(function(t,n){(t.starting_time<S||0==S)&&(S=t.starting_time),t.ending_time>j&&(j=t.ending_time)})})}),0==k&&0==x&&(x=S,k=j));var D=1/(k-x)*(s-v.left-v.right),H=t.time.scale().domain([x,k]).range([v.left,s-v.right]),I=t.svg.axis().scale(H).orient(h).tickFormat(m.format).ticks(m.tickTime,m.tickNumber).tickSize(m.tickSize);if(C.append("g").attr("class","axis").attr("transform","translate(0,"+(v.top+(B+T)*R)+")").call(I),C.each(function(t,u){t.forEach(function(t,u){function h(t,n){return y?v.top+(B+T)*O[u]:v.top}var s=t.times,g="undefined"!=typeof t.label;C.selectAll("svg").data(s).enter().append(w).attr("x",e).attr("y",h).attr("width",function(t,n){return(t.ending_time-t.starting_time)*D}).attr("cy",h).attr("cx",e).attr("r",B/2).attr("height",B).attr("class",M).style("fill",function(n,e){return p?d(t[p]):d?d(u):null}).on("mousemove",function(n,e){i.call(this,n,u,t)}).on("mouseover",function(n,e){r.call(this,n,e,t)}).on("mouseout",function(n,e){o.call(this,n,e,t)}).on("mousedown",function(n,e){a.call(this,n,e,t)}).on("mouseup",function(n,e){c.call(this,n,e,t)}).on("click",function(n,e){l.call(this,n,u,t)}).each(f),g&&n.append("text").attr("class","timeline-label").attr("transform","translate(0,"+(B/2+v.top+(B+T)*O[u])+")").text(g?t.label:t.id),"undefined"!=typeof t.icon&&n.append("image").attr("class","timeline-label").attr("transform","translate(0,"+(v.top+(B+T)*O[u])+")").attr("xlink:href",t.icon).attr("width",v.left).attr("height",B)})}),Math.ceil(s)>Math.ceil(E.width)){var P=t.behavior.zoom().x(H),q=function(){var n=Math.min(0,Math.max(E.width-s,t.event.translate[0]));P.translate([n,0]),C.attr("transform","translate("+n+",0)"),u(n*D,H)};P.on("zoom",q),n.attr("class","scrollable").call(P)}b&&C.selectAll("text").attr("transform",function(t){return"rotate("+b+")translate("+(this.getBBox().width/2+10)+","+this.getBBox().height/2+")"});var G=C[0][0].getBoundingClientRect();if(F(),_){var J=H(new Date);n.append("svg:line").attr("x1",J).attr("y1",z.marginTop).attr("x2",J).attr("y2",g-z.marginBottom).style("stroke",z.color).style("stroke-width",z.width)}}var e=["circle","rect"],i=function(){},r=function(){},o=function(){},a=function(){},c=function(){},l=function(){},u=function(){},f=function(){},h="bottom",s=null,g=null,m={format:t.time.format("%I %p"),tickTime:t.time.hours,tickNumber:1,tickSize:6},d=t.scale.category20(),p=null,w="rect",x=0,k=0,v={left:30,right:30,top:30,bottom:30},y=!1,b=!1,B=20,T=5,_=!1,z={marginTop:25,marginBottom:0,width:1,color:d},M="timeline-item";return n.margin=function(t){return arguments.length?(v=t,n):v},n.orient=function(t){return arguments.length?(h=t,n):h},n.itemHeight=function(t){return arguments.length?(B=t,n):B},n.itemMargin=function(t){return arguments.length?(T=t,n):T},n.height=function(t){return arguments.length?(g=t,n):g},n.width=function(t){return arguments.length?(s=t,n):s},n.display=function(t){return arguments.length&&e.indexOf(t)!=-1?(w=t,n):w},n.tickFormat=function(t){return arguments.length?(m=t,n):m},n.hover=function(t){return arguments.length?(i=t,n):i},n.mouseover=function(t){return arguments.length?(r=t,n):t},n.mouseout=function(t){return arguments.length?(o=t,n):t},n.mousedown=function(t){return arguments.length?(a=t,n):t},n.mouseup=function(t){return arguments.length?(c=t,n):t},n.click=function(t){return arguments.length?(l=t,n):l},n.scroll=function(t){return arguments.length?(u=t,n):u},n.afterRender=function(t){return arguments.length?(f=t,n):f},n.colors=function(t){return arguments.length?(d=t,n):d},n.beginning=function(t){return arguments.length?(x=t,n):x},n.ending=function(t){return arguments.length?(k=t,n):k},n.rotateTicks=function(t){return b=t,n},n.stack=function(){return y=!y,n},n.showToday=function(){return _=!_,n},n.showTodayFormat=function(t){return arguments.length?(z=t,n):z},n.colorProperty=function(t){return arguments.length?(p=t,n):p},n.itemClassName=function(t){return arguments.length?(M=t,n):M},n}});