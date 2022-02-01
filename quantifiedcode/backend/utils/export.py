# -*- coding: utf-8 -*-
"""
    Contains export function used to translate database objects into dictionaries based on a mapping.
"""

from __future__ import unicode_literals
from __future__ import print_function

from six import string_types

def isiterable(x):
    try:
        iter(x)
        return True
    except TypeError:
        return False

def isdictionarylike(x):
    return True if hasattr(x,'items') and hasattr(x,'keys') and hasattr(x,'values') else False


def export(d, key):
    """
    Exports a set of values from a nested dict.

    Example usage:

    d = {
            'name' : 'test',
            'remote_servers' :

                { 'us' :
                    {'ip' : [111,201,32,1],
                     'password' : 'super_secret_pw'},
                  'eu' :
                    {'ip' : [111,22,37,3],
                     'password' : 'super_secret_pw'
                    },
                }
        }

    #We only want to export the name and the ip of the remote servers, but not their passwords!

    export(d,('name', {'remote_servers' : {'*' : ('ip',)} } ))

    #Return value:
    #{'name': 'test', 'remote_servers': {'eu': {'ip': [111, 22, 37, 3]}, 'us': {'ip': [111, 201, 32, 1]}}}

    As usual, the '*' is a wildcard that matches all keys from a dict.

    """
    ed = {}

    if d is None:
        return None

    def set_if_not_null(d, key, value):
        if value is not None:
            d[key] = value
        else:
            d[key] = None

    if isinstance(key, (tuple, list)):
        for key_params in key:
            res = export(d, key_params)
            ed.update(res)
    elif isinstance(key, string_types):
        if key == '*':
            if isdictionarylike(d):
                for d_key in d:
                    set_if_not_null(ed, d_key, d[d_key])
        else:
            try:
                # we must try to access this argument
                # and should not check the "in" operator first
                # since otherwise we will not load lazy-loaded
                # documents correctly
                set_if_not_null(ed, key, d[key])
            except KeyError:
                pass
    elif isinstance(key, dict):
        for key_name, key_value in key.items():
            if key_name == '*':
                if isinstance(d, dict):
                    for d_key in d:
                        set_if_not_null(ed, d_key, export(d[d_key], key_value))
                elif isiterable(d):
                    return [v for v in [export(element, key_value) for element in d] if v is not None]
            elif callable(key_name):
                for d_key in d:
                    if key_name(d_key):
                        set_if_not_null(ed, d_key, export(d[d_key], key_value))
            else:
                try:
                    # we must try to access this argument
                    # and should not check the "in" operator first
                    # since otherwise we will not load lazy-loaded
                    # documents correctly
                    set_if_not_null(ed, key_name, export(d[key_name], key_value))
                except KeyError:
                    pass
    elif callable(key):
        return key(d)
    return ed
