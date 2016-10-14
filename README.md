# Collaboration Folders

Adds handling of multi-level Folder structures.

## Project Details

See [TESTSTATUS file](./TESTSTATUS.md) for latest testing information.

#### Built Using:
Aras 11.0 SP7

#### Versions Tested:
Aras 11.0 SP7, Aras 11.0 SP5 (open release)

#### Browsers Tested:
Internet Explorer 11, Firefox 38 ESR, Chrome

> Though built and tested using Aras 11.0 SP7, this project should function in older releases of Aras 11.0 and Aras 10.0.

## How It Works

Each Folder can list simple attachments (files) or controlled (related) items, like Documents or Parts (Poly Item List).

Multi-level folder tree grid allows droping files onto folder rows. And it provides actions to view,lock/unlock items. And actions to add controlled items or sub folders to folder rows

Folder Templates: Allow creating pre-defined folder structures with pre-defined files or controlled items linked. These get copied to folders created from a template.

Team access: Enables collaboration on data managed in folders by allowing access permissions to team members with roles: Manager, Member, Guest. The entire folder sturcture or sub structures can have their own "private" teams.

Folder structure or sub-structures can have their own "private" teams.

## Installation

#### Important!
**Always back up your code tree and database before applying an import package or code tree patch!**

### Pre-requisites

1. Aras Innovator installed (version 11.0 SPx preferred)
2. Aras Package Import tool
3. Collaboration Folders Import Packages

### Install Steps

1. Backup your database and store the BAK file in a safe place.
2. Open up the Aras Package Import tool.
3. Enter your login credentials and click **Login**
  * _Note: You must login as root for the package import to succeed!_
4. Enter the package name in the TargetRelease field.
  * Optional: Enter a description in the Description field.
5. Enter the path to your local `..\CollaborationFolders\Import\1_CommonUtilities\imports.mf` file in the Manifest File field.
6. Select **aras.labs.CommonUtilities** in the Available for Import field.
7. Select Type = **Merge** and Mode = **Thorough Mode**.
8. Click **Import** in the top left corner.

Repeat steps 5-8 for each of the following packages:

* Package 2
  * Path: `..\CollaborationFolders\Import\2_CommonGridUtilities\imports.mf`
  * Available to Import: Common Grid Utilities
* Package 3
  * Path: `..\CollaborationFolders\Import\3_InnovatorPLM\imports.mf`
  * Available to Import: com.aras.innovator.solution.PLM
* Package 4
  * Path: `..\CollaborationFolders\Import\4_InnovatorCore\imports.mf`
  * Available to Import: com.aras.innovator.core
* Package 5
  * Path: `..\CollaborationFolders\Import\5_RenameCollaborationFolders\imports.mf`
  * Available to Import: Collaboration Folders
* Package 6
  * Path: `..\CollaborationFolders\Import\6_CollaborationFolders\imports.mf`
  * Available to Import: Collaboration Folders
* Package 7
  * Path: `..\CollaborationFolders\Import\7_Optional_CollaborationFoldersOnTOC\imports.mf`
  * Available to Import: Collaboration Folders
* Package 8
  * Path: `..\CollaborationFolders\Import\8_ConfigurationData\imports.mf`
  * Available to Import: Collaboration Folders
* Package 9
  * Path: `..\CollaborationFolders\Import\9_Optional_FoldersOnProgram\imports.mf`
  * Available to Import: Collaboration Folders
* Package 10
  * Path: `..\CollaborationFolders\Import\10_Optional_FoldersOnProject\imports.mf`
  * Available to Import: com.aras.innovator.solution.Project
* Package 11
  * Path: `..\CollaborationFolders\Import\11_Optional_FoldersAddToProject\imports.mf`
  * Available to Import: Collaboration Folders
* Package 12
  * Path: `..\CollaborationFolders\Import\12_Optional_FoldersProject\imports.mf`
  * Available to Import: com.aras.innovator.solution.Project
* Package 13
  * Path: `..\CollaborationFolders\Import\13_Optional_SetPackageVersion\imports.mf`
  * Available to Import: Collaboration Folders

## Usage

TODO: Write usage instructions

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

For more information on contributing to this project, another Aras Labs project, or any Aras Community project, shoot us an email at araslabs@aras.com.

## Credits

Original author: Rolf Laudenbach at Aras Corporation.

Updated for 11.0 SP5/SP7 and published to Github by Eli Donahue. @elijdonahue

## License

Aras Labs projects are published to Github under the MIT license. See the [LICENSE file](./LICENSE.md) for license rights and limitations.
