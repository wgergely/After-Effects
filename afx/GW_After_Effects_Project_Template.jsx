#target aftereffects

/*
Gergely Wootsch, hello@gergely-wootsch.com
Script to create my standard After Effects project template

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
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


function doIt(){
  app.newProject();
  app.project.bitsPerChannel = 16; //8,16,32;
  app.project.linearBlending = true; //bolean;
  app.project.items.addComp(CLIENT + dash + PROJECT + dash + SEQUENCE + dash + SHOT + dash + PRECOMP_SUFFIX, WIDTH, HEIGHT, 1, 5, FPS);
  app.project.items.addComp(CLIENT + dash + PROJECT + dash + SEQUENCE + dash + SHOT + dash + MAINCOMP_SUFFIX, WIDTH, HEIGHT, 1, 5, FPS);
  app.project.items.addFolder('assets');
  app.project.items.addFolder('elements');
  app.project.items.addFolder('precomps');
}
