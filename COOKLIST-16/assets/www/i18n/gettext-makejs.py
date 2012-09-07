#!/usr/bin/python
import os
import polib
import sys
import time

projectname = "cooklist-"
namespace = "Cooklist"



def do_script(lang):
    f = open('lang-'+lang+'.js','w')
    f.write('///////////////////////////////////////////////\n')
    f.write('// Translation object for ->'+lang+"<-\n")
    f.write('// gettext-makejs.py written by La Gentz 2009\n')
    f.write('// generated on: %s\n' % time.ctime())
    f.write('///////////////////////////////////////////////\n\n')
    
    f.write(namespace+'.trans.'+lang+' = {};\n')
    f.write('var t='+namespace+'.trans.'+lang+';\n')
    po = polib.pofile(lang+os.sep+'LC_MESSAGE'+os.sep+projectname+lang+'.po')
    
    for entry in po.translated_entries():
        entr = u"t['%s'] = '%s';\n" % (entry.msgid.replace("'", "\\'"),entry.msgstr.replace("'", "\\'"))
        print entr.encode('utf-8')
        f.write( entr.encode("utf-8"))
    
    f.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
            print "\nUse it like: gettext-makejs.py en de es\n"
            print "This will create following files: lang-en.js, lang-de.js, lang-es.js"
            print "Include one of thoses files in dependence of the user-lang\n"

    for arg in sys.argv[1:]:
        do_script(arg)

    
