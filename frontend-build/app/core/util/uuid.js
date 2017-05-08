/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 *
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/

define([],function(){"use strict";for(var r=[],t=0;256>t;++t)r[t]=(16>t?"0":"")+t.toString(16).toUpperCase();return function(){var t=4294967295*Math.random()|0,n=4294967295*Math.random()|0,a=4294967295*Math.random()|0,o=4294967295*Math.random()|0;return r[255&t]+r[t>>8&255]+r[t>>16&255]+r[t>>24&255]+"-"+r[255&n]+r[n>>8&255]+"-"+r[n>>16&15|64]+r[n>>24&255]+"-"+r[63&a|128]+r[a>>8&255]+"-"+r[a>>16&255]+r[a>>24&255]+r[255&o]+r[o>>8&255]+r[o>>16&255]+r[o>>24&255]}});