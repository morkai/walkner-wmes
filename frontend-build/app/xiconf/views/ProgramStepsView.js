// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/time","app/core/View","app/xiconf/templates/programSteps"],function(e,t,a,r){"use strict";var u={m:.001,k:1e3,M:1e6,G:1e9};return a.extend({template:r,serialize:function(){return{idPrefix:this.idPrefix,steps:this.serializeSteps()}},serializeSteps:function(){var e=this.model.get("program");return e?e.steps.map(this.serializeStep,this).filter(function(e){return null!==e}):[]},serializeStep:function(t,a){if(!t.enabled)return null;var r=(this.model.get("steps")||[])[a],u={index:a,type:t.type,label:e.isString(t.label)&&t.label.length?t.label:null,progressBarWidth:"0%",stepClassName:"is-idle",progressBarClassName:"progress-bar-default",value:"",unit:null,minValue:null,maxValue:null,props:[]},i=this.model.get("program").type;return"t24vdc"===i?this.serializeT24vdcStep(t,u):"glp2"===i&&this.serializeGlp2Step(t,u),r&&(u.value=this.prepareStepValue(r.value,r.unit,u.unit),u.progressBarWidth=r.progress+"%",u.stepClassName="is-"+r.status,u.progressBarClassName=this.getProgressBarClassName(r.status)),u},serializeT24vdcStep:function(e,a){switch(e.type){case"pe":a.unit="Ω",a.maxValue=e.resistanceMax.toLocaleString(),a.props.push({key:"T",value:t.toString(e.startTime+e.duration,!1,!0)},{key:"R",sub:"max",value:a.maxValue,unit:"Ω"},{key:"U",value:e.voltage.toLocaleString(),unit:"V"});break;case"sol":a.unit="V",a.props.push({key:"U",value:e.voltage.toLocaleString(),unit:"V"});break;case"fn":a.unit="W",a.minValue=e.powerMin.toLocaleString(),a.maxValue=e.powerMax.toLocaleString(),a.props.push({key:"T",value:t.toString(e.startTime+e.duration,!1,!0)},{key:"U",value:e.voltage.toLocaleString(),unit:"V"},{key:"P",sub:"req",value:e.powerReq.toLocaleString(),unit:"W"},{key:"P",sub:"min",value:a.minValue,unit:"W"},{key:"P",sub:"max",value:a.maxValue,unit:"W"});break;case"wait":"auto"===e.kind&&a.props.push({key:"T",value:t.toString(e.duration,!1,!0)}),a.props.push({key:"U",value:e.voltage.toLocaleString(),unit:"V"})}},serializeGlp2Step:function(e,a){switch(e.type){case"pe":a.unit="Ω",a.maxValue=e.setValue.toLocaleString(),a.props.push({key:"T",value:t.toString(e.duration,!1,!0)},{key:"R",sub:"set",value:a.maxValue,unit:a.unit},{key:"I",sub:"pr",value:e.ipr.toLocaleString(),unit:"A"},{key:"U",value:e.u.toLocaleString(),unit:"V"});break;case"iso":a.unit=["MΩ","mA","V"][e.mode],a.minValue=e.setValue.toLocaleString(),a.props.push({key:"T",value:t.toString(e.startTime+e.duration,!1,!0)},{key:["R","I","A"][e.mode],sub:"set",value:a.minValue,unit:a.unit},{key:"U",value:e.u.toLocaleString(),unit:"V"},{key:"R",sub:"max",value:e.rMax.toLocaleString(),unit:"MΩ"});break;case"program":a.props.push({key:"U",value:e.voltage.toLocaleString(),unit:"V"});break;case"fn":if(a.unit=["A","W","W",0,0,0,"V"][e.mode]||null,a.props.push({key:"T",value:t.toString(e.startTime+e.duration,!1,!0)},{key:["I","P","P","cosφ",0,0,"U","RPM"][e.mode]||null,sub:["set","apparent","active",0,0,0,"residual"][e.mode]||null,value:e.setValue.toLocaleString(),unit:a.unit},{key:"U",value:e.voltage.toLocaleString(),unit:"V"}),5!==e.mode){var r=0!==e.lowerToleranceRel||0!==e.upperToleranceRel,u=r?Math.round(e.setValue*((100-e.lowerToleranceRel)/100)*100)/100:e.lowerToleranceAbs,i=r?Math.round(e.setValue*((100+e.upperToleranceRel)/100)*100)/100:e.upperToleranceAbs;a.minValue=u.toLocaleString(),a.maxValue=i.toLocaleString()}e.lampCount&&a.props.push({key:"FL",sub:"count",value:e.lampCount},{key:"FL",sub:"time",value:t.toString(e.lampDuration||0)});break;case"vis":a.props.push({key:"T",sub:"wait",value:t.toString(e.duration,!1,!0)},{key:"T",sub:"max",value:t.toString(e.maxDuration,!1,!0)});break;case"wait":"auto"===e.kind&&a.props.push({key:"T",value:t.toString(e.duration,!1,!0)})}},getProgressBarClassName:function(e){var t="success"===e?"progress-bar-success":"failure"===e?"progress-bar-danger":"progress-bar-warning";return"active"===e&&(t+=" progress-bar-striped active"),t},prepareStepValue:function(e,t,a){if(!e)return"0";if(0>e)return"";if(t&&t.length>1&&(e=this.convertRawValue(e,t,a)),1>e)return(Math.round(1e3*e)/1e3).toString().substr(1);var r;return r=100>e?Math.round(100*e)/100:1e3>e?Math.round(10*e)/10:Math.round(e),r.toLocaleString().replace(/\s+/g,"")},convertRawValue:function(e,t,a){var r=t.charAt(0),i=a.charAt(0);if(r===i)return e;var s=u[r],l=u[i];return s&&l?e*s/l:e}})});