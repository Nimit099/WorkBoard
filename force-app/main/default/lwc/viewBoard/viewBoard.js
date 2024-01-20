import { LightningElement, api, track } from 'lwc';
import updateticketfield from '@salesforce/apex/ViewBoard.updateticketfield';
import createtickets from '@salesforce/apex/ViewBoard.createticket';
import getBoardData from '@salesforce/apex/ViewBoard.getBoardData';
import temporarydeleteticket from '@salesforce/apex/ViewBoard.temporarydeleteticket';

import { NavigationMixin } from "lightning/navigation";
export default class ViewBoard extends NavigationMixin(LightningElement) {

    @api boardid;
    @api boardname;
    @track fieldlist = [];
    @track ticketlist = [];

    @track today;
    @track fieldid;
    @track boarddata = [];
    @track ticketId;
    @track ticketName;
    @track deletedticketlist = [];
    @track searchkey = '';

    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;
    @track spinnertable = false;

    @track isRecyclemodal = false;
    @track openticketmodal = false
    @track createticketmodal = false;
    @track fieldsfound = false;
    @track viewboard = true;

    @track firstPart;
    @track secondPart;

    // Create ticket variables
    get options() {
        return [
            { label: 'Low', value: 'Low' },
            { label: 'Medium', value: 'Medium' },
            { label: 'High', value: 'High' },
        ];
    }
    @track deletemodal = false;
    @track ticketpopupdata;


    connectedCallback() {
        try {

            this.today = new Date();
            var dd = String(this.today.getDate()).padStart(2, '0');
            var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = this.today.getFullYear();
            this.today = yyyy + '-' + mm + '-' + dd;
            this.spinnertable = true;

            if (this.boardname.includes(' ')) {
                var words = this.boardname.split(' ');
                this.firstPart = words[0];
                this.secondPart = words.slice(1).join(' ')
            } else {
                let midpoint = Math.ceil(this.boardname.length / 2);
                this.firstPart = this.boardname.slice(0, midpoint);
                this.secondPart = this.boardname.slice(midpoint);
            }

            this.getboardfieldandticket();


        } catch (error) {
            console.error('OUTPUT ViewBoard connected: ', error.message);
            this.spinnertable = false;
        }
    }

    getboardfieldandticket() {
        try {
            getBoardData({ boardId: this.boardid })
                .then(result => {
                    this.spinnertable = false;
                    this.fieldlist = result.fieldList;

                    result.ticketList.forEach(ticket => {
                        if (ticket.DeletedDate__c == undefined) {
                            this.ticketlist.push(ticket)
                        } else {
                            this.deletedticketlist.push(ticket);
                        }
                    });

                    this.search(null);

                    if (this.fieldlist.length > 0) {
                        this.fieldsfound = true;
                    }
                }).catch(error => {
                    this.enqueueToast.push({ status: 'failed', message: 'FAILED TO GET TICKET' });
                    this.toastprocess(null);
                    console.error(error.message);
                });
        } catch (error) {
            console.error(error);
            this.enqueueToast.push({ status: 'failed', message: 'FAILED TO GET TICKET' });
            this.toastprocess(null);
            this.spinnertable = false;
        }

    }

    renderedCallback() {
        try {
            this.ticketlist.forEach(ticket => {
                if (ticket.Color__c != undefined) {
                    let tic = this.template.querySelector("div[data-id =" + ticket.Id + "]");
                    if (tic != null) {
                        tic.style.background = ticket.Color__c;
                    }
                }
            });
        } catch (e) {
            console.error(e.message);
            this.spinnertable = false;
        }
    }

    search(event) {
        try {
            if (event != null) {
                this.searchkey = event.target.value;
                this.searchkey = this.searchkey.trim()
            }

            this.boarddata = [];
            this.fieldlist.forEach(field => {
                let tickets = [];
                this.ticketlist.forEach(ticket => {
                    if (ticket.Field__c == field.Id) {
                        if (ticket.Name.toLowerCase().includes(this.searchkey.toLowerCase()) ||
                            ticket.TicketNumber__c.toLowerCase().includes(this.searchkey.toLowerCase())) {
                            tickets.push(ticket);
                        }
                    }
                })
                this.boarddata.push({ "field": field, "ticket": tickets })
            });
        } catch (error) {
            console.error('OUTPUT : ', error.message);
            this.spinnertable = false;
        }
    }

    dragstart(event) {
        try {
            this.ticketId = event.currentTarget.dataset.id;
            this.fieldid = event.currentTarget.dataset.fieldid;
            let arr = this.template.querySelectorAll('.fieldbody');
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i];
                element.style = 'border:dotted;';
            }
        } catch (error) {
            this.spinnertable = false;
            console.error('OUTPUT dragstart : ', error.message);
        }
    }

    dragover(event) {
        try {
            event.preventDefault();
        } catch (error) {
            this.spinnertable = false;
            console.error(error);
        }
    }

    dragdone() {
        try {
            let arr = this.template.querySelectorAll('.fieldbody');
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i];
                element.style = 'border:none;';
            }
        } catch (error) {
            this.spinnertable = false;
            console.error(error);
        }
    }

    dropzone(event) {
        try {
            let fieldId = event.currentTarget.dataset.id;

            if (fieldId != this.fieldid) {
                this.boarddata = [];

                updateticketfield({ ticketId: this.ticketId, fieldId: fieldId })
                    .then(() => {

                    }).catch(error => {
                        this.spinnertable = false;
                        this.enqueueToast.push({ status: 'failed', message: 'TICKET UPDATE FAILED' });
                        this.toastprocess(null);
                        console.error('updateticketfield : ', error.message);
                    })

                this.ticketlist.forEach(ticket => {
                    if (this.ticketId == ticket.Id) {
                        ticket.Field__c = fieldId;
                    }
                });

                this.search(null);
            }

            let arr = this.template.querySelectorAll('.fieldbody');
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i];
                element.style = 'border:none;';
            }

        } catch (error) {
            this.spinnertable = false;
            this.enqueueToast.push({ status: 'failed', message: 'TICKET UPDATE FAILED' });
            this.toastprocess(null);
            console.error('OUTPUT dropzone: ', (error.message));
        }
    }

    openclosecreateticket() {
        try {
            this.createticketmodal = !this.createticketmodal
        } catch (error) {
            this.spinnertable = false;
            console.error('OUTPUT : ', error.message);
        }
    }

    saveticket(event) {
        try {
            let ticket = JSON.parse(JSON.stringify(event.detail));
            this.openclosecreateticket();
            this.createticket(ticket);

        } catch (error) {
            this.spinnertable = false;
            console.error('OUTPUT errors: ', error.message);
        }
    }

    saveandnewticket(event) {
        try {
            let ticket = JSON.parse(JSON.stringify(event.detail));
            this.createticket(ticket);
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    createticket(ticket) {
        try {
            this.spinnertable = true;
            createtickets({ newticket: ticket })
                .then(result => {
                    ticket.Id = result.Id;
                    this.ticketlist.push(ticket);
                    this.search(null);
                    this.spinnertable = false;
                    if (!this.createticketmodal) {
                        this.enqueueToast.push({ status: 'success', message: 'TICKET CREATED SUCCESSFULLY' });
                        this.toastprocess(null);
                    } else {
                        this.template.querySelector('c-createticketpopup').createtickettoast('success');
                    }
                }).catch(error => {
                    this.spinnertable = false;
                    if (!this.createticketmodal) {
                        this.enqueueToast.push({ status: 'failed', message: 'TICKET CREATED FAILED' });
                        this.toastprocess(null);
                    } else {
                        this.template.querySelector('c-createticketpopup').createtickettoast('failed');
                    }
                    console.error('createtickets' + error.message);
                });
        } catch (error) {
            this.spinnertable = false;
            console.error('createticket method' + error.message);
        }
    }

    handlePopstate() {
        // Perform any necessary cleanup or actions when the user navigates back
        this.disconnectedCallback();
    }

    openclosedeletepopup(event) {
        try {
            this.deletemodal = !this.deletemodal;
            if (this.deletemodal) {
                this.ticketId = event.currentTarget.dataset.id;
                this.ticketName = event.currentTarget.dataset.name;
            }
        } catch (error) {
            this.spinnertable = false;
            console.error('OUTPUT : ', error.message);
        }
    }

    handletemporarydeleteticket(event) {
        try {
            this.ticketId = event.detail;

            temporarydeleteticket({ ticketId: this.ticketId })
                .then(() => {

                    this.ticketlist.forEach((ticket, index) => {
                        if (ticket.Id == this.ticketId) {
                            ticket.DeletedDate__c = this.today;
                            this.deletedticketlist.push(this.ticketlist.splice(index, 1)[0]);
                            this.enqueueToast.push({ status: 'success', message: 'TICKET DELETED SUCCESSFULLY' });
                            this.toastprocess(null);
                        }
                    });

                    this.search(null);

                }).catch(error => {
                    this.spinnertable = false;
                    this.enqueueToast.push({ status: 'failed', message: 'TICKET DELETE FAILED' });
                    this.toastprocess(null);
                    console.error(error.message);
                });

            this.openclosedeletepopup();
        } catch (error) {
            this.spinnertable = false;
            this.enqueueToast.push({ status: 'failed', message: 'TICKET DELETE FAILED' });
            this.toastprocess(null);
            console.error(error.message);
        }
    }

    selectdropdown(event) {
        if (event.detail.value == 'recycle') {
            this.isRecyclemodal = !this.isRecyclemodal;
        } else {
            let cmpDef = {
                componentDef: "c:home"
            };
            let encodedDef = btoa(JSON.stringify(cmpDef));
            this[NavigationMixin.Navigate]({
                type: "standard__webPage",
                attributes: {
                    url: "/one/one.app#" + encodedDef
                }
            });
        }
    }

    opencloserecyclepopup() {
        try {
            this.isRecyclemodal = !this.isRecyclemodal;
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    permanentdeleteticket(event) {
        try {
            let ticketId = event.detail;
            this.deletedticketlist.forEach((ticket, index) => {
                if (ticket.Id == ticketId) {
                    this.deletedticketlist.splice(index, 1);
                }
            })

        } catch (error) {
            this.spinnertable = false;
            this.enqueueToast.push({ status: 'failed', message: 'TICKET DELETE FAILED' });
            this.toastprocess(null);
            console.error('OUTPUT : ', error.message);
        }
    }

    restoreticket(event) {
        try {
            let ticketId = event.detail;
            this.deletedticketlist.forEach((ticket, index) => {
                if (ticket.Id == ticketId) {
                    this.ticketlist.push(this.deletedticketlist.splice(index, 1)[0]);
                }
            })

            this.search(null);

        } catch (error) {
            this.spinnertable = false;
            this.enqueueToast.push({ status: 'failed', message: 'TICKET RESTORE FAILED' });
            this.toastprocess(null);
            console.error('OUTPUT : ', error.message);
        }
    }

    openticket(event) {
        try {
            if (this.deletemodal == false) {                             // Keep it so while click on delete it will not open ticketpopup
                if (!this.openticketmodal) {
                    this.ticketId = event.currentTarget.dataset.id;
                } else {
                    this.ticketlist = [];
                    this.deletedticketlist = [];
                    this.getboardfieldandticket();
                }
                this.openticketmodal = !this.openticketmodal;
            }
        } catch (error) {
            this.spinnertable = false;
            this.enqueueToast.push({ status: 'failed', message: 'TICKET FAILED TO OPEN' });
            this.toastprocess(null);
            console.error('OUTPUT : ', error.message);
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

    updatedticket() {
        this.ticketlist = [];
        this.deletedticketlist = [];
        this.getboardfieldandticket();
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.handlePopstate.bind(this));
    }
}