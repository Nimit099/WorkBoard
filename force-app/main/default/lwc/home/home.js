import { LightningElement, track, api } from 'lwc';
import createboard from '@salesforce/apex/HomePage.createboard';
import boards from '@salesforce/apex/HomePage.boards';
import { NavigationMixin } from "lightning/navigation";
export default class Home extends NavigationMixin(LightningElement) {

  @track today;
  @track boardlist = [];
  @track recyclelist = [];
  @track userlist = [];
  @track boarduserrelationlist = [];
  @track commentlist = [];
  @track ticketlist = [];
  @track fieldlist = [];

  @track boards;
  @track searchkey;
  @track isShowModal = false;
  @track name = '';
  @track description;
  @track isRecyclemodal = false;
  count;
  indexval = 1;
  @track boardid;
  @track boardname;
  @track deletemodal = false;
  @track boardfound = false;
  @track spinnertable = false;

  @track boardfield = [];
  @track boardticket = [];
  @track boardcomment = [];
  @track boarduserrelation = [];

  // This variables use in Toast
  @track enqueueToast = [];
  @track ongoingtoast;


  connectedCallback() {
    try {

      this.spinnertable = true;

      // This is use to get todays date 
      this.today = new Date();
      var dd = String(this.today.getDate()).padStart(2, '0');
      var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = this.today.getFullYear();
      this.today = yyyy + '-' + mm + '-' + dd;

      // Created By Nimit Shah on 21/08/2023
      // This is use to get Boards, Fields, Tickets, User, BoardUsers, Comments List
      boards()
        .then(result => {
          this.commentlist = result.comments;
          this.boarduserrelationlist = result.boarduserlimit;
          this.userlist = result.users;
          this.ticketlist = result.tickets;
          this.fieldlist = result.fields;
          this.boardlist = result.boards;
          let board = [];
          let recycleboard = [];
          this.boardlist.forEach((element) => {
            if (element.DeletedDate__c == undefined) {
              board.push(element);
            } else {
              recycleboard.push(element);
            }
          })
          this.recyclelist = recycleboard;
          this.boards = board;
          this.count = this.boards.length;
          this.spinnertable = false;
          if (this.count > 0) {
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
      console.error('OUTPUT home connected: ', error.message);
    }
  }

  // Created By Nimit Shah on 21/08/2023
  // This function is use to give index to the boards
  get index() {
    if (this.indexval > this.count) {
      this.indexval = 1;
    }
    return this.indexval++;
  }

  // Created By Nimit Shah on 21/08/2023
  // This function is use to search board 
  search(event) {
    try {
      this.spinnertable = true;
      var temparaylist = [];
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
        this.boards = temparaylist;
      } else {
        temparaylist = [];
        this.boardlist.forEach((element) => {
          if (element.DeletedDate__c == undefined) {
            temparaylist.push(element);
          }
        })
        this.boards = temparaylist;
      }
      this.count = this.boards.length;
      if (this.count > 0) {
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

  // Created By Nimit Shah on 21/08/2023
  // This function is use to open the Board or View the Board
  openboard(event) {
    try {
      this.boardid = event.currentTarget.dataset.id;
      this.boardname = event.currentTarget.dataset.name;
      this.boardfield = [];
      this.boardticket = [];

      this.fieldlist.forEach(field => {
        if (field.Board__c === this.boardid) {
          this.boardfield.push(field);
        }
      });
      this.boardfield.forEach(field => {
        this.ticketlist.forEach(ticket => {
          if (ticket.Field__c == field.Id) {
            this.boardticket.push(ticket);
          }
        });
      });

      let cmpDef = {
        componentDef: "c:viewBoard",
        attributes: {
          hboardid: this.boardid,
          hboardname: this.boardname,
          hfieldlist: this.boardfield,
          hticketlist: this.boardticket,
          hcommentlist: this.boardcomment,
          hboarduserrelationlist: this.boarduserrelation
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

  // Created By Nimit Shah on 21/08/2023
  // This function is use to open Create Board popup
  opencreatepopup() {
    this.isShowModal = true;
  }

  // Created By Nimit Shah on 21/08/2023
  // This function is use to take input of Board Details
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

  // Created By Nimit Shah on 21/08/2023
  // This function is use to save records of Boards
  saveboardaction() {
    try {

      // This is use to create new board
      if (this.name == null || this.name == undefined || this.name.trim() == '') {
        this.enqueueToast.push({ status: 'error', message: 'PLEASE ENTER NAME' });
        this.toastprocess(null);

      } else {
        this.spinnertable = true;
        this.isShowModal = false;
        let boardrecord = {
          'sobjectType': 'Board__c'
        };
        boardrecord['Name'] = this.name;
        boardrecord['Description__c'] = this.description;
        createboard({ board: boardrecord })
          .then(result => {
            this.name = '';
            this.description = '';
            this.indexval = 1;
            let newboard = [{ "CreatedDate__c": this.today, "Id": result.Id, "Name": result.Name, "Description__c": result.Description__c }];
            this.boardlist.push(newboard[0]);
            this.boards.push(newboard[0]);
            this.count = this.boards.length;
            this.enqueueToast.push({ status: 'success', message: 'BOARD CREATED SUCCESSFULLY' })
            this.toastprocess(null);
            if (this.count > 0) {
              this.boardfound = true;
            } else {
              this.boardfound = false;
            }
            this.spinnertable = false;
          }).catch(error => {
            console.error('OUTPUT handlepopupaction apex: ', error.message);
          })
      }

    } catch (error) {
      console.error('OUTPUT handlepopupaction : ', error.message);
    }
  }

  // Created By Nimit Shah on 21/08/2023
  // This function is use to cancel while creating board
  cancelboardaction() {
    try {

      this.isShowModal = false;
      this.name = '';
      this.description = '';

    } catch (error) {
      console.error(error.message);
    }
  }

  // Created By Nimit Shah on 21/08/2023
  // This function is use to open delete popup to delete the popup
  handledeleteaction(event) {
    try {

      if (this.deletemodal == false) {
        this.boardname = event.currentTarget.dataset.name;
        this.boardid = event.currentTarget.dataset.id;
        this.deletemodal = true;
      }
      else {
        this.boardid = event.detail;
        var temp;
        if (this.boardid != 0) {
          this.spinnertable = true;
          this.boards.forEach((element, index) => {
            if (element.Id.toLowerCase().includes(this.boardid.toLowerCase())) {
              temp = index;
            }
          });
          var recycleboard = this.boards.splice(temp, 1);

          this.boardlist.forEach((element, index) => {
            if (element.Id.toLowerCase().includes(this.boardid.toLowerCase())) {
              temp = index;
            }
          })
          this.boardlist.splice(temp, 1);
          recycleboard = [{ "CreatedDate__c": recycleboard[0].CreatedDate__c, "DeletedDate__c": this.today, "Id": recycleboard[0].Id, "Name": recycleboard[0].Name }];
          this.recyclelist.push(recycleboard[0]);
          this.indexval = 1;
          this.count = this.boards.length;
          if (this.count > 0) {
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
    }
    catch (error) {
      console.error('OUTPUT handledeleteaction : ', error.message);
    }
  }

  // Created By Nimit Shah on 21/08/2023
  // This function is use to open the recycle page
  recycleaction(event) {
    try {
      if (this.isRecyclemodal == false) {
        this.isRecyclemodal = true;
      } else {
        if (event.detail == 'close') {
          this.isRecyclemodal = false;
        } else {
          let temp;
          this.recyclelist.forEach((element, index) => {
            if (element.Id.toLowerCase().includes(event.detail.toLowerCase())) {
              temp = index;
            }
          })
          this.recyclelist.splice(temp, 1);
        }
      }
    } catch (error) {
      console.error('OUTPUT recycleaction : ', error.message);
    }
  }

  // Created By Nimit Shah on 21/08/2023
  // This function is use to restore the boards 
  restoreboard(event) {
    try {
      let temp;
      this.recyclelist.forEach((element, index) => {
        if (element.Id.toLowerCase().includes(event.detail.toLowerCase())) {
          temp = index;
        }
      })
      var restoreboard = this.recyclelist.splice(temp, 1);
      this.boardlist.push(restoreboard[0]);
      this.boards.push(restoreboard[0]);
      this.indexval = 1;
      this.count = this.boards.length;
      if (this.count > 0) {
        this.boardfound = true;
      } else {
        this.boardfound = false;
      }
    }
    catch (error) {
      console.error('OUTPUT restoreboard : ', error.message);
    }
  }

  // Created By Nimit Shah on 21/08/2023
  // This function is use to store the ticket data which is send by the viewBoard page
  @api handletickets(task, updatedticket) {
    try {

      let i;
      if (task == 'update') {
        this.ticketlist.forEach(function (ticket, index) {
          if (ticket.Id == updatedticket[0].Id) {
            i = index;
          }
        });
        this.ticketlist.splice(i, 1);
        this.ticketlist.push(updatedticket[0]);
      } else if (task == 'create') {
        this.ticketlist.push(updatedticket[0]);
      } else if (task == 'delete') {
        this.ticketlist.forEach(function (ticket, index) {
          if (ticket.Id == updatedticket[0].Id) {
            i = index;
          }
        });
        this.ticketlist.splice(i, 1);
        this.ticketlist.push(updatedticket[0]);
      } else if (task == 'permanentdelete') {
        this.ticketlist.forEach(function (ticket, index) {
          if (ticket.Id == updatedticket[0].Id) {
            i = index;
          }
        });
        this.ticketlist.splice(i, 1);
      }
    } catch (error) {
      console.error('OUTPUT handletickets: ', error.message);
    }
  }

  // 21/8/2023 Created By Nimit Shah
  // This function is use to show toast on multiple calls
  // Multiple calls like I press two time save button on create board and it will generate two time red toast 
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