define(["underscore","jquery","jsplumb","app/viewport","app/core/Model","app/core/views/FormView","app/core/util/idAndLabel","app/core/util/uuid","app/planning/util/contextMenu","app/wmes-trw-tests/dictionaries","app/wmes-trw-bases/Base","app/wmes-trw-bases/templates/cluster","app/wmes-trw-bases/templates/message","../Program","./MessageEditFormView","app/wmes-trw-programs/templates/form"],function(t,e,s,i,n,o,a,r,l,d,c,p,h,u,g,f){"use strict";function m(t,e){var s={left:e.offsetLeft,top:e.offsetTop};for(e=e.offsetParent;e;)s.left+=e.offsetLeft,s.top+=e.offsetTop,e=e.offsetParent;return{x:t.pageX-s.left,y:t.pageY-s.top}}return o.extend({template:f,events:t.assign({"change #-base":function(){this.loadBase()},"click #-steps-play":function(){},"click #-steps-add":function(){var t={_id:r(),color:[],length:0,source:{cluster:"",row:-1,col:-1,endpoint:""},target:{cluster:"",row:-1,col:-1,endpoint:""},connector:"Bezier"};this.model.attributes.steps.push(t),this.addStep(t).click()},"click #-steps-delete":function(){this.deleteStep(this.selectedStep)},"click #-steps-up":function(){this.moveStepUp(this.selectedStep)},"click #-steps-down":function(){this.moveStepDown(this.selectedStep)},"click .trw-programs-step":function(t){this.selectStep(t.currentTarget.dataset.id)},"click .trw-programs-canvasAndSteps":function(){this.hideEditor()},'click .trw-testing-prop[data-prop="color"]':function(){return this.showColorEditor(),!1},'click .trw-testing-prop[data-prop="length"]':function(){return this.showLengthEditor(),!1},"mouseenter .trw-base-cluster":function(t){this.showClusterPopover(t.currentTarget.dataset.id)},"mouseleave .trw-base-cluster":function(){this.hideClusterPopover()},"mousedown #-canvas":function(t){t.target.classList.contains("trw-base-canvas-inner")&&this.onMsgCreateStart(t)},"mousedown .trw-base-message":function(t){0===t.button&&this.selectMsg(t)},"dblclick .trw-base-message":function(t){0===t.button&&(this.selectMsg(t),this.showEditMessageDialog())},"contextmenu .trw-base-message":function(t){return this.selectMsg(t),this.showMsgMenu(t),!1}},o.prototype.events),onMsgCreateStart:function(t){this.cancelMsg();var s=this.msg,i=this.$id("canvas"),n=m(t.originalEvent,i[0]);s.startPos=n,s.$canvas=i,s.$ghost=e('<div class="trw-programs-msg-ghost"></div>').css({top:n.y+"px",left:n.x+"px",width:"0px",height:"0px"}).appendTo(i),i.on("mousemove.msg"+this.idPrefix,this.onMsgCreateMove.bind(this)),e(window).on("mouseup.msg"+this.idPrefix,this.onMsgCreateEnd.bind(this))},onMsgCreateMove:function(t){var e=this.msg;e.endPos=m(t.originalEvent,e.$canvas[0]);var s=this.calcMsgBox(e.startPos,e.endPos);e.$ghost.css({top:s.top+"px",left:s.left+"px",width:s.width+"px",height:s.height+"px"})},calcMsgBox:function(t,e){var s=Math.min(t.x,e.x),i=Math.min(t.y,e.y);return{top:i,left:s,width:Math.max(t.x,e.x)-s,height:Math.max(t.y,e.y)-i}},onMsgCreateEnd:function(t){this.msg.endPos&&this.$(t.target).closest(this.msg.$canvas[0]).length&&this.addMsg(this.msg.startPos,this.msg.endPos),this.cancelMsg()},addMsg:function(t,e){var s={_id:r(),steps:[this.model.getStepIndex(this.selectedStep)+1],text:"",hAlign:"center",vAlign:"center",fontSize:24,fontColor:"#FF0000",bgColor:null,borderColor:"#FF0000",borderWidth:4};Object.assign(s,this.calcMsgBox(t,e)),s.width<10||s.height<10||(this.model.get("messages").push(s),this.recountStepMessages(),this.updateMessages(),this.selectMsg(s._id),this.showEditMessageDialog())},deleteMsg:function(){var t=this.msg;if(t.selected){this.model.attributes.messages=this.model.attributes.messages.filter(function(e){return e._id!==t.selected.id});var e=t.selected.$el;this.unselectMsg(),e.remove(),this.recountStepMessages()}},cancelMsg:function(){var t=this.msg;t.startPos&&(e(window).off(".msg"+this.idPrefix),t.$canvas.off(".msg"+this.idPrefix),t.$ghost.remove(),t.$canvas=null,t.$ghost=null,t.startPos=null,t.endPos=null)},selectMsg:function(s){"string"==typeof s&&(s={currentTarget:this.$('.trw-base-message[data-id="'+s+'"]')[0]});this.unselectMsg();var i=this.msg,n=this.$id("canvas"),o=this.$(s.currentTarget).addClass("is-selected"),a=o[0].dataset.id,r=i.selected={id:a,model:t.find(this.model.get("messages"),function(t){return t._id===a}),$canvas:n,$el:o,offset:null,startPos:{x:o[0].offsetLeft,y:o[0].offsetTop},endPos:{x:0,y:0},lastPos:null,resizing:!1,dragging:!1},l=o[0],d=l.firstElementChild;l.style.top=l.offsetTop+"px",l.style.left=l.offsetLeft+"px",l.style.marginTop="0",l.style.marginLeft="0",d.style.width=d.offsetWidth+"px",d.style.height=d.offsetHeight+"px",o.removeClass("is-centered-top is-centered-left"),0===s.button&&(r.offset={x:s.target.offsetWidth-s.offsetX,y:s.target.offsetHeight-s.offsetY},r.lastPos={x:s.pageX,y:s.pageY},s.target.classList.contains("trw-base-message-resize")?(r.resizing=!0,r.endPos=m(s.originalEvent,n[0]),n.addClass("trw-programs-resizing").on("mousemove.msg"+this.idPrefix,this.onMsgResizeMove.bind(this)),e(window).on("mouseup.msg"+this.idPrefix,this.onMsgResizeEnd.bind(this))):(r.dragging=!0,r.endPos.x=r.startPos.x,r.endPos.y=r.startPos.y,n.addClass("trw-programs-dragging").on("mousemove.msg"+this.idPrefix,this.onMsgDragMove.bind(this)),e(window).on("mouseup.msg"+this.idPrefix,this.onMsgDragEnd.bind(this))))},onMsgResizeMove:function(t){var e=this.msg.selected;e.endPos=m(t.originalEvent,e.$canvas[0]),e.endPos.x+=e.offset.x,e.endPos.y+=e.offset.y;var s=this.calcMsgBox(e.startPos,e.endPos),i=e.$el[0],n=i.firstElementChild;i.style.top=s.top+"px",i.style.left=s.left+"px",n.style.width=s.width+"px",n.style.height=s.height+"px"},onMsgResizeEnd:function(){var t=this.msg.selected,e=this.calcMsgBox(t.startPos,t.endPos);Object.assign(t.model,e),this.unselectMsg()},onMsgDragMove:function(t){var e=this.msg.selected;e.endPos.x+=t.pageX-e.lastPos.x,e.endPos.y+=t.pageY-e.lastPos.y,e.lastPos.x=t.pageX,e.lastPos.y=t.pageY;var s=e.$el[0];s.style.top=e.endPos.y+"px",s.style.left=e.endPos.x+"px"},onMsgDragEnd:function(){this.stopMsgDrag();var t=this.msg.selected;t.model.top===t.endPos.y&&t.model.left===t.endPos.x||(t.model.top=t.endPos.y,t.model.left=t.endPos.x,this.unselectMsg())},stopMsgDrag:function(){var t=this.msg.selected;t&&t.dragging&&(t.dragging=!1,t.$canvas.removeClass("trw-programs-dragging"),e(window).off(".msg"+this.idPrefix),t.$canvas.off(".msg"+this.idPrefix))},unselectMsg:function(){var t=this.msg.selected;t&&(t.$canvas.removeClass("trw-programs-resizing trw-programs-dragging"),t.$canvas.find(".trw-base-message.is-selected").removeClass("is-selected"),e(window).off(".msg"+this.idPrefix),t.$canvas.off(".msg"+this.idPrefix),t.model=null,t.$canvas=null,t.$el=null,this.msg.selected=null)},showMsgMenu:function(t){var e={menu:[{label:this.t("form:messages:menu:edit"),handler:this.showEditMessageDialog.bind(this)},{label:this.t("form:messages:menu:delete"),handler:this.deleteMsg.bind(this)}]};l.show(this,t.pageY,t.pageX,e)},showEditMessageDialog:function(){var t=new n(this.msg.selected.model),e=new g({model:t});this.listenTo(t,"change",function(){Object.assign(this.model.getMessage(t.id),t.attributes),this.recountStepMessages(),this.updateMessages()}),i.showDialog(e,this.t("form:messages:title"))},initialize:function(){o.prototype.initialize.apply(this,arguments),this.jsPlumb=null,this.base=null,this.selectedStep=null,this.msg={startPos:null,endPos:null,$canvas:null,$ghost:null},e(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this))},destroy:function(){e(window).off("."+this.idPrefix),this.hideEditor(),this.resetCanvas(!0),this.jsPlumb=null},afterRender:function(){o.prototype.afterRender.call(this),this.$id("base").select2({data:d.bases.map(a)}),this.setUpJsPlumb();var e=this.model.get("base");t.isObject(e)?(this.base=e,this.completeRendering()):this.loadBase()},completeRendering:function(){if(this.resetCanvas(),this.renderCanvas(),this.renderSteps(),t.isEmpty(this.model.get("steps")))this.$id("steps-add").click();else{var e=this.$step(this.selectedStep);this.selectedStep=null,e.length?e.click():this.$(".trw-programs-step").first().click()}},onKeyDown:function(t){"Escape"===t.key?(this.cancelMsg(),this.unselectMsg(),this.hideEditor()):"Delete"===t.key&&this.deleteMsg()},setUpJsPlumb:function(){var t=this;t.jsPlumb=s.getInstance({Container:this.$id("canvas")[0],ConnectionOverlays:[["Arrow",{id:"ARROW",location:-6,cssClass:"trw-base-canvas-arrow",visible:!0,width:22,length:22}],["Label",{id:"LABEL",location:.5,cssClass:"trw-base-canvas-label",visible:!1}]]}),t.jsPlumb.bind("connection",t.onConnectionCreated.bind(t)),t.jsPlumb.bind("click",t.onConnectionClicked.bind(t)),t.jsPlumb.bind("contextmenu",function(e,i){i.preventDefault(),e instanceof s.Connection&&t.showConnectionMenu(i,e.getParameters())})},showConnectionMenu:function(t,e){},showConnectorEditDialog:function(t){console.log(t)},onConnectionCreated:function(t,e){var s=this,i=t.connection.getParameter("step"),n=!1;i||(s.jsPlumb.getConnections().forEach(function(t){t.getParameter("step")===s.selectedStep&&s.jsPlumb.deleteConnection(t)}),t.connection.setParameter("step",s.selectedStep),i=s.selectedStep,n=e&&(e.ctrlKey||e.altKey));var o=s.model.getStep(i),a=s.model.getStepIndex(i),r=t.connection.getOverlay("LABEL");if(r.setLabel((a+1).toString()),r.setVisible(!0),i===s.selectedStep?r.removeClass("trw-base-canvas-faded"):r.addClass("trw-base-canvas-faded"),o.source=t.sourceEndpoint.getParameters(),o.target=t.targetEndpoint.getParameters(),s.updateStep(i),n){var l=s.model.attributes.steps[a+1];l?this.selectStep(l._id):this.$id("steps-add").click()}},onConnectionClicked:function(t){this.selectStep(t.getParameter("step"))},loadBase:function(){var t=this,e=t.$id("base").val();if(t.base=null,t.resetCanvas(),e.length){var s=t.ajax({url:"/trw/bases/"+e});s.fail(function(){i.msg.show({type:"error",time:1e4,text:t.t("FORM:ERROR:baseLoadingFailure")})}),s.done(function(e){t.base=e,t.completeRendering()})}},$cluster:function(t){return this.$('.trw-base-cluster[data-id="'+t+'"]')},$cell:function(t,e,s){return this.$cluster(t).find('.trw-base-cell[data-row="'+e+'"][data-col="'+s+'"]')},resetCanvas:function(t){this.cancelMsg(),this.unselectMsg(),this.jsPlumb&&this.jsPlumb.reset(!t),this.$id("canvas").empty()},renderCanvas:function(){var t=this;if(t.base){var e=[];t.base.clusters.forEach(function(s){e.push(t.renderPartialHtml(p,{cluster:s}))}),t.$id("canvas").html(e.join("")),t.base.clusters.forEach(function(e){e.rows.forEach(function(s,i){s.forEach(function(s,n){var o=t.$cell(e._id,i,n)[0],a=e._id+":"+i+":"+n;s.endpoints.forEach(function(s){t.jsPlumb.addEndpoint(o,{uuid:a+":"+s,anchor:u.ENDPOINT_TO_ANCHOR[s],isSource:!0,isTarget:!0,allowLoopback:!1,maxConnections:-1,endpoint:["Dot",{radius:10}],cssClass:"trw-base-canvas-endpoint",connectorClass:"trw-base-canvas-connector",parameters:{cluster:e._id,row:i,col:n,endpoint:s}})})})})})}},renderMessage:function(t){return this.renderPartialHtml(h,u.formatMessage(t,!0))},renderSteps:function(){var t=this;t.$id("steps").html(""),t.model.get("steps").forEach(function(e){t.addStep(e)})},stepHasAnyMessage:function(e){return t.any(this.model.get("messages"),function(t){return-1!==t.steps.indexOf(e)})},addStep:function(t){var s=this.$id("steps"),i=s[0].childElementCount+1,n=e('<div class="trw-programs-step"></div>').attr("data-id",t._id),o=e('<span class="trw-programs-step-label">'+this.formatDescription(i,t)+"</span>"),a=e('<i class="fa fa-comments-o trw-programs-step-messages"></i>').toggleClass("hidden",!this.stepHasAnyMessage(i));return n.append(o).append(a).appendTo(s),n},deleteStep:function(t){if(1!==this.model.attributes.steps.length){var e=this.$step(t),s=0===e.next().length;this.model.attributes.steps.splice(this.findStepIndex(e[0]),1);var i=e[0].nextElementSibling||e[0].previousElementSibling;e.remove(),i.click(),s||this.recountSteps()}},recountSteps:function(){var t=this;t.$(".trw-programs-step").each(function(e){this.firstElementChild.textContent=this.firstElementChild.textContent.replace(/^[0-9]+\./,e+1+"."),this.querySelector(".trw-programs-step-messages").classList.toggle("hidden",!t.stepHasAnyMessage(e+1))}),t.jsPlumb.getConnections().forEach(function(e){var s=t.model.getStepIndex(e.getParameter("step"));e.getOverlay("LABEL").setLabel((s+1).toString())})},recountStepMessages:function(){var t=this;t.$(".trw-programs-step").each(function(e){this.querySelector(".trw-programs-step-messages").classList.toggle("hidden",!t.stepHasAnyMessage(e+1))})},moveStepUp:function(e){var s=this.model.attributes.steps;if(1!==s.length){var i=t.findIndex(s,{_id:e}),n=this.$step(e),o=this.$id("steps");if(0===i)o.append(n),s.push(s.shift());else{n.insertBefore(n.prev());var a=s[i-1];s[i-1]=s[i],s[i]=a}this.recountSteps(),this.updateMessages()}},moveStepDown:function(e){var s=this.model.attributes.steps;if(1!==s.length){var i=t.findIndex(s,{_id:e}),n=this.$step(e),o=this.$id("steps");if(i===s.length-1)n.insertAfter(o[0].firstElementChild),s.unshift(s.pop());else{n.insertAfter(n.next());var a=s[i+1];s[i+1]=s[i],s[i]=a}this.recountSteps(),this.updateMessages()}},findStepIndex:function(t){for(var e=0;e<t.parentNode.childElementCount;++e)if(t.parentNode.children[e]===t)return e;return-1},findStepEl:function(t){return this.$id("steps")[0].children[t+1]},$step:function(t){return this.$('.trw-programs-step[data-id="'+t+'"]')},selectStep:function(t){var e=this.$id("steps").find(".trw-programs-step.active");if(!e.length||e[0].dataset.id!==t){e.removeClass("active"),this.$step(t).addClass("active");var s=this.model.getStep(t);this.$(".trw-base-cell.active").removeClass("active"),this.$cell(s.source.cluster,s.source.row,s.source.col).addClass("active"),this.$cell(s.target.cluster,s.target.row,s.target.col).addClass("active"),this.selectedStep=t,this.updateSelectedStep(),this.updateConnections(),this.updateMessages()}},updateConnections:function(){var t=this;t.jsPlumb.deleteEveryConnection(),t.model.attributes.steps.forEach(function(e){if(e.source.cluster&&e.target.cluster){var s=e._id===t.selectedStep,i=["trw-base-canvas-connector"];s||i.push("trw-base-canvas-faded"),t.jsPlumb.connect({uuids:[u.formatEndpointUuid(e.source),u.formatEndpointUuid(e.target)],parameters:{step:e._id},detachable:s,cssClass:i.join(" "),connector:e.connector})}})},updateStep:function(t){var e=this.model.getStep(t);this.$step(t).find(".trw-programs-step-label").text(this.formatDescription(this.model.getStepIndex(t)+1,e)),t===this.selectedStep&&this.updateSelectedStep()},updateMessages:function(){var t=this,e=t.model.getStepIndex(t.selectedStep)+1,s=[];t.model.get("messages").forEach(function(i){-1!==i.steps.indexOf(e)&&s.push(t.renderMessage(i))});var i=t.$id("canvas");i.find(".trw-base-message").remove(),i.append(s.join("")),i.find(".trw-base-message").each(function(){var t=this.getBoundingClientRect();this.classList.contains("is-centered-top")&&(this.style.top="50%",this.style.marginTop=Math.round(t.height/2*-1)+"px"),this.classList.contains("is-centered-left")&&(this.style.left="50%",this.style.marginLeft=Math.round(t.width/2*-1)+"px")})},updateSelectedStep:function(){var t=this.model.getStep(this.selectedStep);this.$id("no").text(this.t("PROPERTY:steps.no",{no:this.model.getStepIndex(t._id)+1})),this.updateProp("source",this.formatEndpoint(t.source)),this.updateProp("target",this.formatEndpoint(t.target)),this.updateProp("color",this.formatColor(t.color,"?")),this.updateProp("length",this.formatLength(t.length,"?"))},updateProp:function(t,e){this.$('.trw-testing-prop[data-prop="'+t+'"]').find(".trw-testing-prop-value").text(e)},formatDescription:function(t,e){return this.t("form:steps:description",{no:t,source:this.formatEndpoint(e.source),target:this.formatEndpoint(e.target),color:this.formatColor(e.color),length:this.formatLength(e.length)})},formatColor:function(t,e){return u.formatColor(t,e)},formatLength:function(t,e){return u.formatLength(t,e)},formatEndpoint:function(t){return u.formatEndpoint(t,this.base)},hideEditor:function(){var t=this.$id("editor");t.find("input").select2("destroy"),t.remove()},showColorEditor:function(){var t=this,s=t.model.getStep(t.selectedStep);t.hideEditor();var i=t.$('.trw-testing-prop[data-prop="color"] > .trw-testing-prop-value'),n=e('<form class="trw-programs-editor"></form>').attr("id",this.idPrefix+"-editor"),o=e("<input>").val(s.color.join(","));n.append(o),n.append('<button class="btn btn-default"><i class="fa fa-check"></i></button>'),n.on("submit",function(){return s.color=o.select2("val"),t.hideEditor(),t.updateStep(s._id),!1});var a=i.position();n.css({top:a.top+"px",left:a.left+"px"}),n.appendTo("body"),o.select2({width:Math.max(i.outerWidth()-40,300)+"px",multiple:!0,allowClear:!0,placeholder:" ",data:u.COLORS.map(function(e){return{id:e,text:t.t("colors:"+e)}})}),o.select2("focus")},showLengthEditor:function(){var t=this,s=t.model.getStep(t.selectedStep);t.hideEditor();var i=t.$('.trw-testing-prop[data-prop="length"] > .trw-testing-prop-value'),n=e('<form class="trw-programs-editor"></form>').attr("id",this.idPrefix+"-editor"),o=e('<input class="form-control">').val(s.length.toString()).css({width:Math.max(i.outerWidth()-40,75)});n.append(o),n.append('<button class="btn btn-default"><i class="fa fa-check"></i></button>'),n.on("submit",function(){return s.length=Math.max(0,parseInt(o.val(),10)||0),t.hideEditor(),t.updateStep(s._id),!1});var a=i.position();n.css({top:a.top+"px",left:a.left+"px"}),n.appendTo("body"),o.focus()},showClusterPopover:function(t){var s=this;s.hideClusterPopover();var i=s.model.getCluster(t);if(i&&i.image){var n=new Image;n.src=i.image,s.$clusterPopover=s.$cluster(t).popover({container:document.body,placement:"top",trigger:"manual",html:!0,content:function(){return'<img src="'+i.image+'" width="'+n.naturalWidth+'" height="'+n.naturalHeight+'">'},template:function(t){return e(t).addClass("trw-base-cluster-popover")}}),s.timers.showClusterPopover=setTimeout(function(){s.$clusterPopover&&s.$clusterPopover[0].dataset.id===t&&s.$clusterPopover.popover("show")},333)}},hideClusterPopover:function(t){clearTimeout(this.timers.showClusterPopover),this.$clusterPopover&&(t&&this.$clusterPopover[0].dataset.id!==t||(this.$clusterPopover.popover("destroy"),this.$clusterPopover=null))}})});