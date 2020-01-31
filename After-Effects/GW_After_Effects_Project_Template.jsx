#target aftereffects

/*
Gergely Wootsch, hello@gergely-wootsch.com
Script to create my standard After Effects project template

*/

var CLIENT = 'CLIENT';
var PROJECT = 'PROJECT';
var SEQUENCE = '010';
var SHOT = '010';
var PRECOMP_SUFFIX = 'precomp';
var MAINCOMP_SUFFIX = 'maincomp';

var WIDTH = 1920;
var HEIGHT = 1080;
var FPS = 25;

var dash = '_';


function doIt() {
  app.newProject();
  app.project.bitsPerChannel = 16; //8,16,32;
  app.project.linearBlending = true; //bolean;
  app.project.items.addComp(CLIENT + dash + PROJECT + dash + SEQUENCE + dash + SHOT + dash + PRECOMP_SUFFIX, WIDTH, HEIGHT, 1, 5, FPS);
  app.project.items.addComp(CLIENT + dash + PROJECT + dash + SEQUENCE + dash + SHOT + dash + MAINCOMP_SUFFIX, WIDTH, HEIGHT, 1, 5, FPS);
  app.project.items.addFolder('assets');
  app.project.items.addFolder('elements');
  app.project.items.addFolder('precomps');
}
