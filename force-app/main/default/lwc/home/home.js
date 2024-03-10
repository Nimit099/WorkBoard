import { LightningElement, track } from 'lwc';
import createboard from '@salesforce/apex/HomePage.createboard';  // This is use to create boards;
import getBoards from '@salesforce/apex/HomePage.getBoards';  // This is use to get the boards;
import searchBoard from '@salesforce/apex/HomePage.searchBoard';  // This is use to get the boards while searching;
import deleteboard from '@salesforce/apex/HomePage.deleteboard';  // This is use to temporary delete the board;

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
            if (element.GB_24__DeletedDate__c == undefined) {
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
          console.error(error.message);
          this.enqueueToast.push({ status: 'failed', message: 'FAILED TO GET BOARD' });
          this.toastprocess(null);
        })
    } catch (error) {
      this.spinnertable = false;
      console.error(error.message);
    }
  }

  get index() {
    if (this.indexval > this.boardlist.length) {
      this.indexval = 1;
    }
    return this.indexval++;
  }

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
            console.error(error.message);
            this.enqueueToast.push({ status: 'failed', message: 'FAILED TO GET BOARD' });
            this.toastprocess(null);
          });
      }, 700);

    } catch (error) {
      this.spinnertable = false;
      console.error('OUTPUT search : ', error.message);
    }
  }

  openboard(event) {
    try {

      this.boardid = event.currentTarget.dataset.id;
      this.boardname = event.currentTarget.dataset.name;

      let cmpDef = {
        componentDef: "GB_24:viewBoard",
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
      console.error(error.message);
    }
  }

  opencloseCreateBoardPopup() {
    this.isShowModal = !this.isShowModal;
    this.name = '';
    this.description = '';
  }

  saveboardaction(event) {
    try {

      // This is use to create new board
      this.spinnertable = true;
      let boardrecord = JSON.parse(JSON.stringify(event.detail));

      createboard({ board: boardrecord })
        .then(result => {

          this.indexval = 1;
          let newboard = [{ "CreatedDate": this.today, "Id": result.Id, "Name": result.Name, "GB_24__Description__c": result.GB_24__Description__c }];

          if (this.searchkey == undefined || newboard[0].Name.toLowerCase().includes(this.searchkey.toLowerCase())) {
            this.boardlist.push(newboard[0]);
          }

          this.enqueueToast.push({ status: 'success', message: 'BOARD CREATE SUCCESSFULLY' });
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
          this.enqueueToast.push({ status: 'error', message: 'FAILED TO SAVE BOARD' });
          this.toastprocess(null);
        })
      this.opencloseCreateBoardPopup();

    } catch (error) {
      this.spinnertable = false;
      this.enqueueToast.push({ status: 'error', message: 'FAILED TO SAVE BOARD' });
      this.toastprocess(null);
      console.error('OUTPUT handlepopupaction : ', error.message);
    }
  }

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

  handletemporarydeleteaction(event) {
    try {

      this.spinnertable = true;

      this.boardid = event.detail;

      if (this.boardid != null) {
        deleteboard({ boardId: this.boardid })
          .then(() => {
            this.boardlist.forEach((element, index) => {
              if (element.Id.includes(this.boardid)) {
                let recycleboard = this.boardlist.splice(index, 1);
                recycleboard[0].GB_24__DeletedDate__c = this.today;
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

  opencloserecyclepopup() {
    this.isRecyclemodal = !this.isRecyclemodal;
  }

  restoreboard(event) {
    try {

      if (this.searchkey == undefined || this.searchkey.trim() == '') {
        this.searchkey = null;
      }
      searchBoard({ searchkey: this.searchkey })
        .then(result => {

          this.boardlist = result;

          this.recyclelist.forEach((element, index) => {
            if (element.Id.includes(event.detail)) {
              this.recyclelist.splice(index, 1);
            }
          })

          this.indexval = 1;
          if (this.boardlist.length > 0) {
            this.boardfound = true;
          } else {
            this.boardfound = false;
          }

          this.spinnertable = false;

        }).catch(error => {
          this.spinnertable = false;
          console.error(error.message);
          this.enqueueToast.push({ status: 'failed', message: 'FAILED TO GET BOARD' });
          this.toastprocess(null);
        });

    } catch (error) {
      this.spinnertable = false;
      console.error(error.message);
    }
  }

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
        componentDef: "GB_24:field",
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
    }
  }

  disconnectedCallback() {
    this.enqueueToast = [];
  }

}