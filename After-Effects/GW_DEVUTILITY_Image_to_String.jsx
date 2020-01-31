var img = new File('/c/users/gergely/Google Drive/dev/git/icons/')
img = img.openDlg();

if (img) {
  img.encoding = 'BINARY';
  img.open('r');
  var string = img.read()
  img.close();

  var w = new Window('palette', 'String', undefined, {
    resizeable: false,
    alignChildren: ['fill', 'fill']
  });
  var text = w.add('edittext', undefined, string.toSource(), {
    alignChildren: ['fill', 'fill'],
    multiline: true
  });
  text.size = [500, 500];

  w.layout.layout(true);
  w.layout.resize();

  w.show()
}
