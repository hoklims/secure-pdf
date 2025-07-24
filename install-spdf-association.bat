@echo off
REM Script pour associer les fichiers .spdf avec le viewer HTML

echo Configuration de l'association de fichiers SPDF...

REM Créer l'association dans le registre Windows
reg add "HKEY_CLASSES_ROOT\.spdf" /ve /d "SecurePDF.Document" /f
reg add "HKEY_CLASSES_ROOT\SecurePDF.Document" /ve /d "Document SecurePDF" /f
reg add "HKEY_CLASSES_ROOT\SecurePDF.Document\DefaultIcon" /ve /d "%~dp0spdf-icon.ico" /f
reg add "HKEY_CLASSES_ROOT\SecurePDF.Document\shell\open\command" /ve /d "\"%ProgramFiles%\Google\Chrome\Application\chrome.exe\" \"file:///%~dp0examples\viewer-demo.html?file=%%1\"" /f

echo Association de fichiers configurée !
echo Les fichiers .spdf s'ouvriront maintenant avec le viewer SecurePDF.

pause
