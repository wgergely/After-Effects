
def abstractmethod(f):
    '''Decorator for an abstract method. Raise an exception if the function is not overridden by child class.'''
    def wrapper(*args, **kwargs):
        self = args[0]
        import inspect
        raise RuntimeError("Abstract function called from: " + self.__class__.__name__ +"."+ f.__name__ +"("+ str(inspect.getargspec(f))+")")
    return wrapper
