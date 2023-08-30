# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)

## GIT ARCHITECTURE

- Create weekly sprint branches and all the development will done here after duration everything merge to master and new sprint will pull through master.
- master where everything merge from the lowest branches.
- MasterTester are the branches where master being tested.
- MasterHome, MasterToast are the branches where every component are distributed after there complete working situation.
- WorkBoard where all the MasterBranches are merge after completely working condition.
- Every pull will be done through WorkBoard.

- PUSH -- weekly sprint --> master --> MasterTester --> MasterBranches --> WorkBoard
- PULL -- weekly sprint <-- master <-- WorkBoard

## NOTE - 

- master branch is not required to match commit with seniors branch.
- After every commits in WorkBoard should be pull by master.
- Weekly Sprints branches will always pull master.
- After completion of week weekly sprint pushes to the master.

## NEXT PHASE OF HOMEPAGE

- Use sessionstorage for the search functionality to remove query. After completing task delete this.
- User can open edit board.
- User can open Reports(Icon Name - calculated_insights) of the board in RecordList.

## 27-2 WEEKLY SPRINT 
- Able to see the field and ticket. (Completed) [ViewBoard ViewBoard.cls, Home, HomePage.cls]
- Able to see the color of ticket. (Completed) [ ViewBoard ]
- Able to do Delete, Restore Ticket, Permanently delete ticket. (Completed) [ViewBoard, RecyclePopup, DeletePopup]
- Give Dropdown button from where user can go to recycle and go back to the homepage.
- Able to Create ticket with fields such as Name, Number, Field, Description, StartDate, EndDate, Ticket Priority and yes create new LWC component called CreateticketPopup.
-Able to see ticket Data by opening the ticket.

## 3-9 WEEKLY SPRINT
- Able to update the ticket data.

## 10-16 WEEKLY SPRINT
- Able to create field. Create new LWC compoenent EditBoard.
- Able to edit field Name from the fieldheader.
- Able to drag and drop field to change order.
