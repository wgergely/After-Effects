import akaPipe.views.proxy.proxyFactory as proxyFactory
import akaPipe.views.proxy.renderSetup as rs

_entries = {
}

def initialize():
    for entry in _entries.iteritems():
        proxyFactory.register(*entry)

def uninitialize():
    for entry in _entries:
        proxyFactory.unregister(entry)
