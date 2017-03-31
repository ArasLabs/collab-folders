--------------------------------------------
Packages Import Instructions
--------------------------------------------


ATTENTION: 
If you are using a previous version (v1-3 or less) of this Item Folders add-on soltution,
then you MUST do stage "0__nash update" first before doing the imports with the Aras import tool !!!



--------------------------------------------
Stage 0 - Nash update

start Nash.aspx tool on the target Aras System and log on as "admin"
(the url to nash.aspy tool could be like this: http://localhost/InnovatorServer/Client/scripts/nash.aspx )

- use text editor and open file 
      .\i0__nash update\Rename PLM CommonUtitlities PackageDefinition.xml

  Select all and paste to Nash input box "XML"

  then, click submit button


--------------------------------------------
Next ... Use the Aras import utiltity tool and log on to the target Aras System and Database with "admin"


--------------------------------------------
Stage - 0 Import subset of "Common Utilities"


Select Mainfest file from folder .\0-Common Utilties v1-6 (partial)\imports.mf and set option "Merge"

then, click the "import" button on top tool bar


--------------------------------------------
Stage - 1  Import part1 of Item Folder add-on


Select Mainfest file from folder .\1-Innovator Core and PLM extensions\imports (admin).mf and set option "Merge"

then, click the "import" button on top tool bar


--------------------------------------------
Stage - 2  Import part2 of Item Folder add-on

Select Mainfest file from folder .\2-Item Folders 1\imports (admin).mf and set option "Merge"

then, click the "import" button on top tool bar


--------------------------------------------
Stage - 3  Import part2 of Item Folder add-on

Select Mainfest file from folder .\3-Item Folders 2\imports (admin).mf and set option "Merge"

then, click the "import" button on top tool bar


--------------------------------------------
Stage - 4  Adds Folder Features to standard Program ItemType


Select Mainfest file from folder .\4-Folders On Program And Project\1_import\imports (admin).mf and set option "Merge"

then, click the "import" button on top tool bar


------------------------------------------------------------------------------------------------------
Stage - 5 Copy code tree overlay files to the code tree of the the target Aras System

- open folder "CodeTreeOverlays" and select "innovator" and copy this folder
- on the target Aras System go to the installation folders and paste the copy over the "innovator" folder
- confirm to add or overwrite folders and files.



