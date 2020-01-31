from PySide2 import QtCore

command = 'python "{script}" "{scene}" {sets} {start} {end} {version} "{target}"'.format(
    script=r'E:\GW_ASSETS\git\TKWWBK\maya\abcExport.py',
    scene=r'\\gordo\jobs\tkwwbk_8077\build\julio_test\scenes\animatic\02_Uther_Pendragon\uther_v10_gergely_010.ma',
    sets='set_knights,set_knight_mano,set_camera,set_base,set_arthur_low',
    start=100,
    end=101,
    version=5,
    target=r'C:\temp'
)

QtCore.QProcess.startDetached(command);
