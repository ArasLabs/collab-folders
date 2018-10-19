# Collaboration Folders
#### *Manage Files and Items in ML-Structs*

Adds handling of multi-level Folder structures. (new Item Types, see data model). On top of Aras Solutions "Product Engineering" and "Program Management"

Each Folder can list simple attachments (files) or controlled (related) items, like Documents or Parts (Poly Item List).

Multi-level folder tree grid allows dropping files onto folder rows. And it provides actions to view, lock/unlock items. And actions to add controlled items or sub folders to folder rows

Folder Templates: Allow creating pre-defined folder structures with pre-defined files or controlled items linked. These get copied to folders created from a template.

Team access: Enables collaboration on data managed in folders by allowing access permissions to team members with roles: Manager, Member, Guest. The entire folder structure or sub structures can have their own "private" teams.

folder structure or sub structures can have their own "private" teams.

## History

This project and the following release notes have been migrated from the old Aras Projects page. Unlike community projects that have been migrated and archived, this project will be updated for compatibility with the latest release of Aras Innovator. 

Release | Notes
--------|--------
[v6.0](https://github.com/ArasLabs/collab-folders/releases/tag/v6.0)| Aras 11 SP 14
[v5.5](https://github.com/ArasLabs/collab-folders/releases/tag/v5.5) | Aras 11 SP11
[v5.4](https://github.com/ArasLabs/collab-folders/releases/tag/v5.4) | Aras 11 SP7-SP9. Fix structure of optional import folders.
[v5.3](https://github.com/ArasLabs/collab-folders/releases/tag/v5.3) | Aras 11 SP7-SP9.
[v5.0](https://github.com/ArasLabs/collab-folders/releases/tag/v5.0) | Aras 11SP6 & SP7. Read the Readme.txt for a functional overview and installation instructions.
[v4.0](https://github.com/ArasLabs/collab-folders/releases/tag/v4.0) | Aras 11 only. Read the Readme.txt. Collaboration Folders Add-On Package. Please also read the documentation.
[v3.1](https://github.com/ArasLabs/collab-folders/releases/tag/v3.1) | Aras 10 only. Read the Readme.txt. Collaboration Folders Add-On Package. Please also read the documentation.
[v3.0.1](https://github.com/ArasLabs/collab-folders/releases/tag/v3.0.1) | Aras 10 only. Read the Readme.txt. Collaboration Folders Add-On Package. Please also read the documentation.
[v3.0](https://github.com/ArasLabs/collab-folders/releases/tag/v3.0) | Aras 9.x only. Read the Readme.txt. Collaboration Folders Add-On Package. Please also read the documentation of v2-1.
[v2.1](https://github.com/ArasLabs/collab-folders/releases/tag/v2.1) | Collaboration Folders Add-On Package. Enhanced Folders Life Cycle and Permissions (for Team and Archive scenario). Improved performance for large structures (level by level). Requires 9.3SP6 or higher !!
[v1.7](https://github.com/ArasLabs/collab-folders/releases/tag/v1.7) | Item Folders Add-On Package. Enhanced Folders Life Cycle and Permissions (for Archive scenario). Requires 9.3SP6 or higher !!
[v1.6](https://github.com/ArasLabs/collab-folders/releases/tag/v1.6) | Item Folders Add-On Package. Enhanced Folders grid. File drag-n-drop. Enhanced folder templates.
[v1.5](https://github.com/ArasLabs/collab-folders/releases/tag/v1.5) | Item Folders Add-On Package. Displays folder related documents before sub folders in Navigator, now.

#### Supported Aras Versions

Project | Aras
--------|------
[v6.0](https://github.com/ArasLabs/collab-folders/releases/tag/v6.0)| 11 SP14
[v5.5](https://github.com/ArasLabs/collab-folders/releases/tag/v5.5) | 11 SP11
[v5.4](https://github.com/ArasLabs/collab-folders/releases/tag/v5.4) | 11 SP7-SP9
[v5.3](https://github.com/ArasLabs/collab-folders/releases/tag/v5.3) | 11 SP7-SP9
[v5.0](https://github.com/ArasLabs/collab-folders/releases/tag/v5.0) | 11 SP6-SP7
[v4.0](https://github.com/ArasLabs/collab-folders/releases/tag/v4.0) | 11
[v3.1](https://github.com/ArasLabs/collab-folders/releases/tag/v3.1) | 10
[v3.0.1](https://github.com/ArasLabs/collab-folders/releases/tag/v3.0.1) | 10
[v3.0](https://github.com/ArasLabs/collab-folders/releases/tag/v3.0) | 9.x
[v2.1](https://github.com/ArasLabs/collab-folders/releases/tag/v2.1) | 9.3 SP6+
[v1.7](https://github.com/ArasLabs/collab-folders/releases/tag/v1.7) | 9.3 SP6+
[v1.6](https://github.com/ArasLabs/collab-folders/releases/tag/v1.6) | 9.3
[v1.5](https://github.com/ArasLabs/collab-folders/releases/tag/v1.5) | 9.3

## Installation

#### Important!
**Always back up your code tree and database before applying an import package or code tree patch!**

### Pre-requisites

1. Aras Innovator installed
2. Aras Package Import tool
3. **collab-folders** import packages
4. **collab-folders** code tree overlay

### Install Steps

1. Backup your code tree and store the backup in a safe place.
2. Copy the Innovator folder from the project's CodeTree subdirectory.
3. Paste the Innovator folder into the root directory of your Aras installation.
  * Tip: This is the same directory that contains the InnovatorServerConfig.xml file.
4. Backup your database and store the BAK file in a safe place.
5. Open up the Aras Package Import tool.
6. Enter your login credentials and click **Login**
  * _Note: You must login as root for the package import to succeed!_
7. Follow the instructions in [Import/READ_ME.txt](./Import/READ_ME.txt) for importing packages.
  * _Note: Steps 2-3 replace the code tree overlay steps in the READ___ME.txt instructions._
#### Important!
  **If you are using a language pack, some default variables will be changed. To use Collaboration Folders with a language pack, you must do the following.**
  1. Navigate to Admin > Variables within the TOC.
  2. Find the variables related to Collab Folders by searching tGridCfg*
  3. Modify the values to the following:
   
Variable| Value
--------|------
tGridCfg cFolder Template | Client/Solutions/ItemFolders/xml/cFolderStructureConfig.xml
tGridCfg Project | Client/Solutions/ItemFolders/xml/cFolderStructureConfig.xml
tGridCfg Root Folders TOC | Client/Solutions/ItemFolders/xml/cFolderStructureConfig.xml
tGridCfg User Folders TOC | Client/Solutions/ItemFolders/xml/cFolderStructureConfig.xml


## Usage

See [Collaboration Folders Concept v3-0.pdf](./Documentation/Collaboration%20Folders%20Concept%20v3-0.pdf) or [Collaboration Folders User Guide v3-0.pdf](./Documentation/Collaboration%20Folders%20User%20Guide%20v3-0.pdf) for more information on using this project.

![Screenshot of Collaboration Folders](./Screenshots/Item%20Folders%20Screen1.jpg)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

For more information on contributing to this project, another Aras Labs project, or any Aras Community project, shoot us an email at araslabs@aras.com.

## Credits

Created by Rolf Laudenbach, Aras Corporation.

## License

Aras Labs projects are published to Github under the MIT license. See the [LICENSE file](./LICENSE.md) for license rights and limitations.
