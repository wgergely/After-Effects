import re
from maya import cmds

def init():
    #Find all objects that have the same shortname as another
    #We can indentify them because they have | in the name
    duplicates = [f for f in cmds.ls() if '|' in f]
    #Sort them by hierarchy so that we don't rename a parent before a child.
    duplicates.sort(key=lambda obj: obj.count('|'), reverse=True)

    #if we have duplicates, rename them
    if duplicates:
        for name in duplicates:
            # extract the base name
            m = re.compile("[^|]*$").search(name)
            shortname = m.group(0)

            # extract the numeric suffix
            m2 = re.compile(".*[^0-9]").match(shortname)
            if m2:
                stripSuffix = m2.group(0)
            else:
                stripSuffix = shortname

            #rename, adding '#' as the suffix, which tells maya to find the next available number
            try:
                newname = cmds.rename(name, (stripSuffix + "#"))
                print "renamed %s to %s" % (name, newname)
            except:
                print 'error renaming {}'.format(name)

        return "Renamed %s objects with duplicated name." % len(duplicates)
    else:
        return "No Duplicates"
