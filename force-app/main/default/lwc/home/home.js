// STATUS FOR THE FUNCTIONS - WORKING, WORKING-FATAL, DONE, DEPRECATED

import { LightningElement, track } from 'lwc';
import createboard from '@salesforce/apex/HomePage.createboard';  // This is use to create boards;
import getBoards from '@salesforce/apex/HomePage.getBoards';  // This is use to get the boards;
import searchBoard from '@salesforce/apex/HomePage.searchBoard';  // This is use to get the boards while searching;
import deleteboard from '@salesforce/apex/HomePage.deleteboard';  // This is use to temporary delete the board;
import permanentdeleteboard from '@salesforce/apex/HomePage.permanentdeleteboard'; // This is use to permanent delete the board.



import { NavigationMixin } from "lightning/navigation";

export default class Home extends NavigationMixin(LightningElement) {

  @track today; // To store todays date

  // This variables are use to store all the board data according to there specification
  @track boardlist = [];
  @track recyclelist = [];

  // This is use to store searching keywords
  @track searchkey = '';
  @track typingTimer = 100;

  // This variable is use for creation of board
  @track isShowModal = false;
  @track name = '';
  @track description;

  // This is use for index numbers
  indexval = 1;

  // This varialbes is use to open, close and perform action on Delete and Recycle popup
  @track boardid;
  @track boardname;
  @track deletemodal = false;
  @track isRecyclemodal = false;

  // This variables is used to run and stop spinner and make boardnotfound page visible
  @track boardfound = false;
  @track spinnertable = false;

  // This variables use in Toast
  @track enqueueToast = [];
  @track ongoingtoast;


  // CREATION - Created By Nimit Shah on 12/08/2023  ---  This is use to get Boards and arrange the boards.
  // UPDATION - Updated By Nimit Shah on 23/8/2023   ---  Remove usage of Boardlist variable
  // CONDITION - Cleaned code
  // STATUS - DONE
  connectedCallback() {
    try {

      this.spinnertable = true;

      // This is use to get todays date 
      this.today = new Date();
      var dd = String(this.today.getDate()).padStart(2, '0');
      var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = this.today.getFullYear();
      this.today = yyyy + '-' + mm + '-' + dd;

      getBoards()
        .then(result => {

          let board = [];
          let recycleboard = [];
          result.forEach((element) => {
            if (element.DeletedDate__c == undefined) {
              board.push(element);
            } else {
              recycleboard.push(element);
            }
          })

          this.recyclelist = recycleboard;
          this.boardlist = board;

          if (this.boardlist.length > 0) {
            this.boardfound = true;
          } else {
            this.boardfound = false;
          }

          this.spinnertable = false;

        }).catch(error => {
          this.spinnertable = false;
          console.error('OUTPUT home connected apex : ', error.message);
        })
    } catch (error) {
      this.spinnertable = false;
      console.error('OUTPUT home connected: ', error.message);
    }
  }


  // CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to give index to the boards
  // UPDATION - Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code.
  // CONDITION - Cleaned code
  // STATUS - DONE
  get index() {
    if (this.indexval > this.boardlist.length) {
      this.indexval = 1;
    }
    return this.indexval++;
  }

  // CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to search board.
  // UPDATION - Updated By Nimit Shah on 23/08/2023 --- Add condition so that every functionality work with searching
  // CONDITION - Cleaned code
  // STATUS - DONE
  search(event) {
    try {
      clearTimeout(this.typingTimer);

      this.searchkey = event.target.value;
      this.spinnertable = true;

      //*********** Key Debouncing technique *************//
      this.typingTimer = setTimeout(() => {
        if (this.searchkey == undefined || this.searchkey.trim() == '') {
          this.searchkey = null;
        }
        searchBoard({ searchkey: this.searchkey })
          .then(result => {

            this.indexval = 1;

            this.boardlist = result;

            if (this.boardlist.length > 0) {
              this.boardfound = true;
            } else {
              this.boardfound = false;
            }

            this.spinnertable = false;

          }).catch(error => {
            this.spinnertable = false;
            console.error('OUTPUT home connected apex : ', error.message);
          });
      }, 700);

    } catch (error) {
      this.spinnertable = false;
      console.error('OUTPUT search : ', error.message);
    }
  }

  // CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to open the Board or View the Board.
  // UPDATION - Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code.
  // CONDITION - Cleaned code
  // STATUS - FATAL --- Need to change code in viewBoard.
  openboard(event) {
    try {

      this.boardid = event.currentTarget.dataset.id;
      this.boardname = event.currentTarget.dataset.name;

      let cmpDef = {
        componentDef: "c:viewBoard",
        attributes: {
          boardid: this.boardid,
          boardname: this.boardname,
        }
      };
      let encodedDef = btoa(JSON.stringify(cmpDef));
      this[NavigationMixin.Navigate]({
        type: "standard__webPage",
        attributes: {
          url: "/one/one.app#" + encodedDef
        }
      });

    } catch (error) {
      this.spinnertable = false;
      console.error('OUTPUT openboard : ', error.message);
    }
  }

  // CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to open & close Create Board popup.
  // UPDATION - Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code
  // CONDITION - Cleaned code
  // STATUS - DONE
  opencloseCreateBoardPopup() {
    this.isShowModal = !this.isShowModal;
    this.name = '';
    this.description = '';
  }

  // CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to save records of Boards.
  // UPDATION - Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code
  // CONDITION - Cleaned code
  // STATUS - DONE
  saveboardaction(event) {
    try {

      // This is use to create new board


      this.spinnertable = true;
      let boardrecord = JSON.parse(JSON.stringify(event.detail));

      createboard({ board: boardrecord })
        .then(result => {

          this.indexval = 1;
          let newboard = [{ "CreatedDate": this.today, "Id": result.Id, "Name": result.Name, "Description__c": result.Description__c }];

          if (this.searchkey == undefined || newboard[0].Name.toLowerCase().includes(this.searchkey.toLowerCase())) {
            this.boardlist.push(newboard[0]);
          }

          this.enqueueToast.push({ status: 'success', message: 'BOARD CREATED SUCCESSFULLY' });
          this.toastprocess(null);

          this.spinnertable = false;

          if (this.boardlist.length > 0) {
            this.boardfound = true;
          } else {
            this.boardfound = false;
          }

        }).catch(error => {
          this.spinnertable = false;
          console.error('OUTPUT handlepopupaction apex: ', error.message);
          this.enqueueToast.push({ status: 'error', message: 'FAILED TO STORE BOARD' });
          this.toastprocess(null);
        })
      this.opencloseCreateBoardPopup();

    } catch (error) {
      this.spinnertable = false;
      this.enqueueToast.push({ status: 'error', message: 'FAILED TO STORE BOARD' });
      this.toastprocess(null);
      console.error('OUTPUT handlepopupaction : ', error.message);
    }
  }

  // CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to open and close delete popup
  // UPDATION - Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code
  // CONDITION - Cleaned code
  // STATUS - DONE
  openclosedeletepopup(event) {
    try {
      this.deletemodal = !this.deletemodal;
      if (this.deletemodal && event != null) {
        this.boardname = event.currentTarget.dataset.name;
        this.boardid = event.currentTarget.dataset.id;
      }
    } catch (error) {
      this.spinnertable = false;
      console.error(error.message);
    }
  }

  // CREATION - CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to open delete popup to delete the boards
  // UPDATION - UPDATION - Updated By Nimit Shah on 23/08/2023 --- Remove boardlist variable usage in this
  // CONDITION - Cleaned code
  // STATUS - DONE
  handletemporarydeleteaction(event) {
    try {

      this.spinnertable = true;

      this.boardid = event.detail;

      if (this.boardid != null) {
        deleteboard({ boardId: this.boardid })
          .then(result => {
            this.boardlist.forEach((element, index) => {
              if (element.Id.includes(this.boardid)) {
                let recycleboard = this.boardlist.splice(index, 1);
                recycleboard[0].DeletedDate__c = this.today;
                this.recyclelist.push(recycleboard[0]);
              }
            });

            this.indexval = 1;
            if (this.boardlist.length > 0) {
              this.boardfound = true;
            } else {
              this.boardfound = false;
            }

            this.enqueueToast.push({ status: 'success', message: 'BOARD DELETED SUCCESSFULLY' });
            this.toastprocess(null);
            this.spinnertable = false;

          }).catch(error => {
            this.enqueueToast.push({ status: 'error', message: 'BOARD DELETED FAILED' });
            this.toastprocess(null);
            console.error(JSON.stringify(error));
            this.spinnertable = false;
          })

        this.openclosedeletepopup(null);
      }
    } catch (error) {
      this.enqueueToast.push({ status: 'error', message: 'BOARD DELETED FAILED' });
      this.toastprocess(null);
      console.error('OUTPUT handledeleteaction : ', error.message);
      this.spinnertable = false;
    }
  }

  // CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to remove the permanent deleted board
  // UPDATION - Updated By Nimit Shah on 26/08/2023 --- Make it lighter and furnish the code. Made function to remove the board from the list
  // CONDITION - Cleaned code
  // STATUS - DONE
  permanentdeleteBoard(event) {
    try {
      this.recyclelist.forEach((element, index) => {
        if (element.Id.includes(event.detail)) {
          this.recyclelist.splice(index, 1);
        }
      })
    } catch (error) {
      this.spinnertable = false;
      console.error('OUTPUT deleteBoard : ', error.message);
    }
  }

  // CREATION - Created By Nimit Shah on 26/08/2023 --- This function is use to open and close recycle popup  
  // UPDATION - --
  // CONDITION - Cleaned code
  // STATUS - DONE
  opencloserecyclepopup() {
    this.isRecyclemodal = !this.isRecyclemodal;
  }

  // CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to restore the boards 
  // UPDATION - Updated By Nimit Shah on 23/08/2023 --- Add data to boardlist so that when someone is searching and restore the board then it work smooth
  // CONDITION - Cleaned code
  // STATUS - DONE
  restoreboard(event) {
    try {

      this.recyclelist.forEach((element, index) => {
        if (element.Id.includes(event.detail)) {
          let restoreboard = this.recyclelist.splice(index, 1);
          restoreboard[0].DeletedDate__c = undefined;
          if (this.searchkey == undefined || restoreboard[0].Name.toLowerCase().includes(this.searchkey.toLowerCase())) {
            this.boardlist.push(restoreboard[0]);
          }
        }
      })

      this.indexval = 1;
      if (this.boardlist.length > 0) {
        this.boardfound = true;
      } else {
        this.boardfound = false;
      }

    } catch (error) {
      this.spinnertable = false;
      console.error('OUTPUT restoreboard : ', error.message);
    }
  }

  // CREATION - Created By Nimit Shah on 21/08/2023 --- This is use to call toast 
  // UPDATION - Updated By Nimit Shah on 21/08/2023 --- This is use to call multiple time toast at once.
  // CONDITION - Cleaned code
  // STATUS - DONE
  toastprocess(event) {
    try {
      if (event != null) {
        this.ongoingtoast = !this.ongoingtoast;
      }

      if (this.enqueueToast.length > 0) {
        if (!this.ongoingtoast) {
          this.ongoingtoast = !this.ongoingtoast;
          let toastdata = this.enqueueToast.splice(0, 1);
          setTimeout(() => {
            this.template.querySelector('c-toast').showToast(toastdata[0].status, toastdata[0].message);
          }, 1);
        }
      }

    } catch (error) {
      this.spinnertable = false;
      console.error(error.message);
    }
  }

  opencloseeditboard(event) {
    try {

      this.boardid = event.currentTarget.dataset.id;
      this.boardname = event.currentTarget.dataset.name;

      let cmpDef = {
        componentDef: "c:field",
        attributes: {
          boardid: this.boardid,
          boardname: this.boardname,
          home: true
        }
      };
      let encodedDef = btoa(JSON.stringify(cmpDef));
      this[NavigationMixin.Navigate]({
        type: "standard__webPage",
        attributes: {
          url: "/one/one.app#" + encodedDef
        }
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  navigateToBoardreport(event) {
    try {
      const recordId = event.currentTarget.dataset.id;

      this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
          recordId: recordId,
          actionName: 'view'
        }
      });
    } catch (error) {
      console.error(error.message);
      console.error(error + ' >> In Navigating report');
    }
  }
  // CREATION - Created By Nimit Shah on 21/08/2023
  // This function is use to remove the enqueueToast 
  disconnectedCallback() {
    this.enqueueToast = [];
  }

}