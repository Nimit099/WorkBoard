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

PUSH -- weekly sprint --> master --> MasterTester --> MasterBranches --> WorkBoard
PULL -- weekly sprint <-- master <-- WorkBoard

## NOTE - 

- master branch is not required to match commit with seniors branch.
- After every commits in WorkBoard should be pull by master.
- Weekly Sprints branches will always pull master.
- After completion of week weekly sprint pushes to the master.
