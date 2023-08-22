// STATUS FOR THE FUNCTIONS - WORKING, WORKING-FATAL, DONE, DEPRECATED

import { LightningElement, track } from 'lwc';
import createboard from '@salesforce/apex/HomePage.createboard';  // This is use to create boards;
import getBoards from '@salesforce/apex/HomePage.getBoards';  // This is use to get the boards;
import { NavigationMixin } from "lightning/navigation";

export default class Home extends NavigationMixin(LightningElement) {

  @track today; // To store todays date

  // This variables are use to store all the board data according to there specification
  @track boardlist = [];
  @track recyclelist = [];
  @track boards;

  // This is use to store searching keywords
  @track searchkey;

  // This variable is use for creation of board
  @track isShowModal = false;
  @track name = '';
  @track description;

  // count;  // Deprecated because we make replacement with this.boards.length;

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


  // Created By Nimit Shah on 12/08/2023  ---  This is use to get Boards and arrange the boards.
  // Updated By Nimit Shah on 22/8/2023   ---  Update to reduce variable like field, ticket, etc and make code lighter.
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
          });

          this.recyclelist = recycleboard;
          this.boards = board;
          this.boardlist = board;

          if (this.boards.length > 0) {
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


  // Created By Nimit Shah on 12/08/2023 --- This function is use to give index to the boards
  // Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code.
  // STATUS - DONE
  get index() {
    if (this.indexval > this.boards.length) {
      this.indexval = 1;
    }
    return this.indexval++;
  }

  // Created By Nimit Shah on 12/08/2023 --- This function is use to search board.
  // Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code.
  // STATUS - DONE
  search(event) {
    try {
      this.spinnertable = true;
      let temparaylist = [];
      this.searchkey = event.target.value;
      this.indexval = 1;
      if (this.searchkey.trim() != '') {
        this.boardlist.forEach((element) => {
          if (element.DeletedDate__c == undefined) {
            if (element.Name.toLowerCase().includes(this.searchkey.toLowerCase())) {
              temparaylist.push(element);
            }
          }
        })
      } else {
        temparaylist = [];
        this.boardlist.forEach((element) => {
          if (element.DeletedDate__c == undefined) {
            temparaylist.push(element);
          }
        })
      }
      this.boards = temparaylist;

      if (this.boards.length > 0) {
        this.boardfound = true;
      } else {
        this.boardfound = false;
      }

      this.spinnertable = false;
    }
    catch (error) {
      console.error('OUTPUT search : ', error.message);
    }
  }

  // Created By Nimit Shah on 12/08/2023 --- This function is use to open the Board or View the Board.
  // Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code.
  // STATUS - FATAL --- Need to change code in viewBoard.
  openboard(event) {
    try {
      this.boardid = event.currentTarget.dataset.id;
      this.boardname = event.currentTarget.dataset.name;

      let cmpDef = {
        componentDef: "c:viewBoard",
        attributes: {
          hboardid: this.boardid,
          hboardname: this.boardname,
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
      console.error('OUTPUT openboard : ', error.message);
    }
  }

  // Created By Nimit Shah on 12/08/2023 --- This function is use to open & close Create Board popup.
  // Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code
  // STATUS - DONE
  opencloseCreateBoardPopup() {
    this.isShowModal = !this.isShowModal;
    this.name = '';
    this.description = '';
  }

  // Created By Nimit Shah on 12/08/2023 --- This function is use to take input of Board Details.
  // Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code
  // STATUS - DONE
  popupinput(event) {
    try {

      if (event.currentTarget.dataset.name == 'name') {
        this.name = event.target.value;
      } else if (event.currentTarget.dataset.name == 'description') {
        this.description = event.target.value;
      }

    } catch (error) {
      console.error('OUTPUT popupinput : ', error.message);
    }
  }

  // Created By Nimit Shah on 12/08/2023 --- This function is use to save records of Boards.
  // Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code
  // STATUS - DONE
  saveboardaction() {
    try {

      // This is use to create new board
      if (this.name == null || this.name == undefined || this.name.trim() == '') {

        this.enqueueToast.push({ status: 'error', message: 'PLEASE ENTER NAME' });
        this.toastprocess(null);

      } else {

        this.spinnertable = true;
        let boardrecord = {
          'sobjectType': 'Board__c'
        };
        boardrecord['Name'] = this.name;
        boardrecord['Description__c'] = this.description;

        createboard({ board: boardrecord })
          .then(result => {

            this.indexval = 1;
            let newboard = [{ "CreatedDate": this.today, "Id": result.Id, "Name": result.Name, "Description__c": result.Description__c }];

            this.boards.push(newboard[0]);
            this.boardlist = this.boards;

            this.enqueueToast.push({ status: 'success', message: 'BOARD CREATED SUCCESSFULLY' });
            this.toastprocess(null);

            this.spinnertable = false;

            if (this.boards.length > 0) {
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
      }

    } catch (error) {
      this.spinnertable = false;
      this.enqueueToast.push({ status: 'error', message: 'FAILED TO STORE BOARD' });
      this.toastprocess(null);
      console.error('OUTPUT handlepopupaction : ', error.message);
    }
  }

  // Created By Nimit Shah on 12/08/2023 --- This function is use to open delete popup to delete the boards
  // Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code.
  // STATUS - DONE
  handledeleteaction(event) {
    try {

      this.deletemodal = !this.deletemodal;
      this.boardname = event.currentTarget.dataset.name;
      this.boardid = event.currentTarget.dataset.id;

      if (event.currentTarget.dataset.id == undefined) {
        this.boardid = event.detail;
        let temp;
        if (this.boardid != 0) {

          this.spinnertable = true;
          this.boards.forEach((element, index) => {
            if (element.Id.includes(this.boardid)) {
              temp = index;
            }
          });
          let recycleboard = this.boards.splice(temp, 1);
          this.boardlist = this.boards;

          recycleboard[0].DeletedDate__c = this.today;
          this.recyclelist.push(recycleboard[0]);

          this.indexval = 1;
          if (this.boards.length > 0) {
            this.boardfound = true;
          } else {
            this.boardfound = false;
          }

          this.enqueueToast.push({ status: 'success', message: 'BOARD DELETED SUCCESSFULLY' });
          this.toastprocess(null);

        }
        this.spinnertable = false;
        this.deletemodal = false;
      }
    } catch (error) {
      console.error('OUTPUT handledeleteaction : ', error.message);
    }
  }

  // Created By Nimit Shah on 12/08/2023 --- This function is use to open the recycle page.
  // Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code.
  // STATUS - DONE
  deleteBoard(event) {
    try {
      this.isRecyclemodal = !this.isRecyclemodal;

      if (event.detail == 'close') {

        this.isRecyclemodal = false;
      } else {
        if (!event.isTrusted) {
          let temp;
          this.recyclelist.forEach((element, index) => {
            if (element.Id.includes(event.detail)) {
              temp = index;
            }
          })
          this.recyclelist.splice(temp, 1);
        }
      }
    } catch (error) {
      console.error('OUTPUT deleteBoard : ', error.message);
    }
  }

  // Created By Nimit Shah on 12/08/2023 --- This function is use to restore the boards 
  // Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code.
  // STATUS - DONE
  restoreboard(event) {
    try {

      let temp;
      this.recyclelist.forEach((element, index) => {
        if (element.Id.includes(event.detail)) {
          temp = index;
        }
      })

      let restoreboard = this.recyclelist.splice(temp, 1);
      restoreboard[0].DeletedDate__c = undefined;

      this.boards.push(restoreboard[0]);
      this.boardlist = this.boards;

      this.indexval = 1;
      if (this.boards.length > 0) {
        this.boardfound = true;
      } else {
        this.boardfound = false;
      }

    } catch (error) {
      console.error('OUTPUT restoreboard : ', error.message);
    }
  }

  // ************* Deprecated due to remove storing data for ticket field and etc ******************//
  // @api handletickets(task, updatedticket) {
  //   try {

  //     let i;
  //     if (task == 'update') {
  //       this.ticketlist.forEach(function (ticket, index) {
  //         if (ticket.Id == updatedticket[0].Id) {
  //           i = index;
  //         }
  //       });
  //       this.ticketlist.splice(i, 1);
  //       this.ticketlist.push(updatedticket[0]);
  //     } else if (task == 'create') {
  //       this.ticketlist.push(updatedticket[0]);
  //     } else if (task == 'delete') {
  //       this.ticketlist.forEach(function (ticket, index) {
  //         if (ticket.Id == updatedticket[0].Id) {
  //           i = index;
  //         }
  //       });
  //       this.ticketlist.splice(i, 1);
  //       this.ticketlist.push(updatedticket[0]);
  //     } else if (task == 'permanentdelete') {
  //       this.ticketlist.forEach(function (ticket, index) {
  //         if (ticket.Id == updatedticket[0].Id) {
  //           i = index;
  //         }
  //       });
  //       this.ticketlist.splice(i, 1);
  //     }
  //   } catch (error) {
  //     console.error('OUTPUT handletickets: ', error.message);
  //   }
  // }

  // Created By Nimit Shah on 21/08/2023 --- This is use to call toast 
  // Updated By Nimit Shah on 21/08/2023 --- This is use to call multiple time toast at once.
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
      console.error(error.message);
    }
  }

  // Created By Nimit Shah on 21/08/2023
  // This function is use to remove the enqueueToast 
  disconnectedCallback() {
    console.log('OUTPUT : disconnected');
    this.enqueueToast = [];
  }

}