"""Multithreaded alembic exporter for Maya.
"""

from multiprocessing import Process
import os
import uuid
import tempfile
import sys

from TKWWBK.maya.standalone import initialize


class AbcExporter(object):
    """Alembic exporter for maya."""

    def __init__(self, scene=None, version=None, sets=None, start=None, end=None, target=None):
        if not os.path.isfile(scene):
            raise WindowsError('{} does not exists.'.format(scene))
        if not os.path.isdir(target):
            raise WindowsError('{} does not exists.'.format(target))

        self.scene = scene
        self.sets = sets
        self.set = None
        self.start = int(start)
        self.end = int(end)
        self.target = target
        self.version = version

        self.tempfile = self._get_tempfile()

    def _get_tempfile(self):
        """Returns the path of a unique temp file."""
        return os.path.join(
            tempfile.gettempdir(),
            '{}-{}.ma'.format(self.__class__.__name__, uuid.uuid4())
        )

    def saveAs(self):
        with open(self.scene, 'r') as o, open(self.tempfile, 'w') as n:
            for line in o:
                if ('requires "' in line) or ('renderSetup' in line):
                    continue
                n.write(line)

    @staticmethod
    def _abc_obj_string(items):
        s = ''
        for item in items:
            s += '-root {} '.format(item)
        return s

    def export(self, multithreaded=True):
        for s in self.sets:
            self.set = s

            if multithreaded:
                p = Process(target=self._export)
                p.start()
            else:
                self._export()

    def show_widget(self, PySide2):
        app = PySide2.QtCore.QCoreApplication.instance()
        QtWidgets = PySide2.QtWidgets

        self.widget = QtWidgets.QWidget()
        self.widget.show()

    def _export(self):
        """Alembic export function executed in separate threads."""
        _, cmds = initialize()

        cmds.file(self.tempfile, force=True, open=True)
        cmds.select(self.set, replace=True, noExpand=True)

        path = self.target.replace('\\', '/')
        version = 'v{}'.format('%03d' % (self.version,))

        set_members = cmds.listConnections(
            '{set}.dagSetMembers'.format(set=self.set),
            type='transform'
        )

        if not set_members:
            return

        abc_path = '{path}/{set}/{set}_{version}.abc'.format(
            path=path,
            set=self.set,
            version=version
        )

        abc_dir_path = '{path}/{set}/'.format(path=path, set=self.set)
        if not os.path.isdir(abc_dir_path):
            os.makedirs(abc_dir_path)

        cmds.AbcExport(
            j='-frameRange {start} {end} -uvWrite -worldSpace {objects} -file "{path}"'.format(
                start=self.start,
                end=self.end,
                objects=self._abc_obj_string(set_members),
                path=abc_path
            )
        )


def clear_log():
    with open('C:/temp/AbcExportLog.txt', 'w') as f:
        pass


def log(s):
    with open('C:/temp/AbcExportLog.txt', 'a') as f:
        f.write('{}\n'.format(s))


def args():
    clear_log()

    try:
        scene = os.path.normpath(sys.argv[1])
        if not os.path.isfile(scene):
            log('# {} is not a file'.format(scene))
            raise ValueError('# {} is not a file'.format(scene))
    except Exception as err:
        log(err)
        raise ValueError('# No scene path given.')

    try:
        sets = sys.argv[2].replace(' ', '').split(',')
        if not sets:
            raise ValueError('# No set names given.')
    except Exception as err:
        log(sys.argv[2])
        log(sys.argv[2])
        log(err)
        raise ValueError('# No set names given.')

    try:
        start = int(sys.argv[3])
    except Exception as err:
        log(err)
        raise ValueError('# No start frame given.')

    try:
        end = int(sys.argv[4])
    except Exception as err:
        log(err)
        raise ValueError('# No end frame given.')

    try:
        version = int(sys.argv[5])
    except Exception as err:
        log(err)
        raise ValueError('# No version given.')

    try:
        version = int(sys.argv[5])
    except Exception as err:
        log(err)
        raise ValueError('# No version given.')

    try:
        target = os.path.normpath(sys.argv[6])
        if not os.path.isdir(target):
            raise ValueError('# {} is not a folder'.format(target))
    except Exception as err:
        log(err)
        raise ValueError('# No target path given.')

    args = {
        'scene': scene,
        'sets': sets,
        'start': start,
        'end': end,
        'version': version,
        'target': target
    }
    log('Arguments')
    log(args)
    return args


if __name__ == '__main__':
    argsv = args()
    abc = AbcExporter(**argsv)
    abc.saveAs()
    abc.export()
