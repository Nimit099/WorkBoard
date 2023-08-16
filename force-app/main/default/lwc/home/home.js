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
  @track toast = false;

  @track boardfield = [];
  @track boardticket = [];
  @track boardcomment = [];
  @track boarduserrelation = [];


  connectedCallback() {
    try {

      this.spinnertable = true;
      this.today = new Date();
      var dd = String(this.today.getDate()).padStart(2, '0');
      var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = this.today.getFullYear();
      this.today = yyyy + '-' + mm + '-' + dd;
      boards()
        .then(result => {
          this.commentlist = result.comments;
          this.boarduserrelationlist = result.boarduserlimit;
          this.userlist = result.users;
          this.ticketlist = result.tickets;
          this.fieldlist = result.fields;
          this.boardlist = result.boards;
          console.log('OUTPUT connected : ',this.ticketlist.length);
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
          console.log('OUTPUT home connected apex : ', error.message);
        })
    } catch (error) {
      console.log('OUTPUT home connected: ', error.message);
    }
  }

  get index() {
    if (this.indexval > this.count) {
      this.indexval = 1;
    }
    return this.indexval++;
  }
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
      console.log('OUTPUT search : ', error.message);
    }
  }

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
      console.log('OUTPUT : ',this.ticketlist.length);
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
      console.log('OUTPUT openboard : ', error.message);
    }
  }

  opencreatepopup() {
    this.isShowModal = true;
  }

  popupinput(event) {
    try {
      if (event.currentTarget.dataset.name == 'name') {
        this.name = event.target.value;
      } else if (event.currentTarget.dataset.name == 'description') {
        this.description = event.target.value;
      }
    } catch (error) {
      console.log('OUTPUT popupinput : ', error.message);
    }
  }

  handlepopupaction(event) {
    try {
      if (this.isShowModal == false) {
        this.isShowModal = true;
        this.toast = true;
      }
      else {
        if (event.currentTarget.dataset.name === 'Cancel') {
          this.isShowModal = false;
          this.name = '';
          this.description = '';
          this.toast = false;
        } else if (event.currentTarget.dataset.name === 'Save') {        // This is use to create new board
          if (this.name == null || this.name == undefined || this.name.trim() == '') {
            this.template.querySelector('c-toast').showToast('error', 'PLEASE ENTER NAME');
          } else {
            this.spinnertable = true;
            this.isShowModal = false;
            this.toast = true;
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
                this.template.querySelector('c-toast').showToast('success', 'BOARD CREATED SUCCESSFULLY');
                setTimeout(() => {
                  this.toast = false;
                }, 4000);
                if (this.count > 0) {
                  this.boardfound = true;
                } else {
                  this.boardfound = false;
                }
                this.spinnertable = false;
              }).catch(error => {
                console.log('OUTPUT handlepopupaction apex: ', error.message);
              })
          }
        }
      }
    } catch (error) {
      console.log('OUTPUT handlepopupaction : ', error.message);
    }
  }
  handledeleteaction(event) {
    try {
      if (this.deletemodal == false) {
        this.boardname = event.currentTarget.dataset.name;
        this.boardid = event.currentTarget.dataset.id;
        this.deletemodal = true;
        this.toast = true;
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
          this.template.querySelector('c-toast').showToast('success', 'BOARD DELETED SUCCESSFULLY');
          setTimeout(() => {
            this.toast = false;
          }, 4000);
        }
        this.spinnertable = false;
        this.deletemodal = false;
        if (this.boardid == 0) {
          this.toast = false;
        }
      }
    }
    catch (error) {
      console.log('OUTPUT handledeleteaction : ', error.message);
    }
  }

  recycleaction(event) {
    try {
      if (this.isRecyclemodal == false) {
        this.isRecyclemodal = true;
      } else {
        if (event.detail == 'close') {
          this.isRecyclemodal = false;
        } else {
          var temp;
          this.recyclelist.forEach((element, index) => {
            if (element.Id.toLowerCase().includes(event.detail.toLowerCase())) {
              temp = index;
            }
          })
          this.recyclelist.splice(temp, 1);
        }
      }
    } catch (error) {
      console.log('OUTPUT recycleaction : ', error.message);
    }
  }
  restoreboard(event) {
    try {
      var temp;
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
      console.log('OUTPUT restoreboard : ', error.message);
    }
  }
  disconnectedCallback() {
    console.log('OUTPUT : disconnected');
  }

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
        console.log('OUTPUT : ',this.ticketlist.length);
        this.ticketlist.push(updatedticket[0]);
        console.log('OUTPUT : ',this.ticketlist.length);
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
      console.log('OUTPUT handletickets: ', error.message);
    }
  }
  @track menuitemopen = false
  handlemenu(){
    this.menuitemopen = !this.menuitemopen;
  }
}