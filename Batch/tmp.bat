
@echo off
for %%A in ("%~dp0.") do set grandparent=%%~dpA
echo %grandparent%
pause