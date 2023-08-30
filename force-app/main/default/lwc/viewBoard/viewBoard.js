import { LightningElement, api, track } from 'lwc';
import updateticketfield from '@salesforce/apex/viewBoard.updateticketfield';
import createticket from '@salesforce/apex/viewBoard.createticket';
import getBoardData from '@salesforce/apex/viewBoard.getBoardData';
import temporarydeleteticket from '@salesforce/apex/viewBoard.temporarydeleteticket';

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


    @track isRecyclemodal = false;
    @track openticketmodal = false
    @track createticketmodal = false;
    @track fieldsfound = false;
    @track viewboard = true;

    // Create ticket variables
    get options() {
        return [
            { label: 'Low', value: 'Low' },
            { label: 'Medium', value: 'Medium' },
            { label: 'High', value: 'High' },
        ];
    }
    @track isShowModal = false;
    @track fieldid;
    @track name = '';
    @track number = '';
    @track description;
    @track enddate;
    @track startdate;
    @track priority;
    @track deletemodal = false;
    @track ticketpopupdata;


    // CREATION - Created By Nimit Shah on 27/08/2023  ---  This is use to get Fields and Ticket List.
    // UPDATION - Updated By Nimit Shah on 23/8/2023   ---  --
    // CONDITION - Cleaned code
    // STATUS - DONE
    connectedCallback() {
        try {

            this.today = new Date();
            var dd = String(this.today.getDate()).padStart(2, '0');
            var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = this.today.getFullYear();
            this.today = yyyy + '-' + mm + '-' + dd;

            getBoardData({ boardId: this.boardid })
                .then(result => {

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
                });
        } catch (error) {
            console.error('OUTPUT viewBoard connected: ', error.message);
        }
    }

    // CREATION - Created By Nimit Shah on 27/08/2023  ---  This is use to color the tickets.
    // UPDATION - Updated By Nimit Shah on 23/8/2023   ---  --
    // CONDITION - Cleaned code
    // STATUS - WORKING
    renderedCallback() {
        try {
            this.ticketlist.forEach(ticket => {
                if (ticket.Color__c != undefined) {
                    this.template.querySelector("div[data-id =" + ticket.Id + "]").style.background = ticket.Color__c;
                }
            });
        } catch (e) {
            console.log(e);
        }
    }

    // CREATION - Created By Nimit Shah on 27/08/2023  ---  This is use to search tickets.
    // UPDATION - Updated By Nimit Shah on 23/8/2023   ---  --
    // CONDITION - Cleaned code
    // STATUS - WORKING
    search(event) {
        try {
            if (event != null) {
                this.searchkey = event.target.value;
                this.searchkey = this.searchkey.trim()
            }
            this.boarddata = [];
            this.fieldlist.forEach((field) => {
                let tickets = [];
                this.ticketlist.forEach((ticket) => {
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
        }
    }

    // CREATION - Created By Nimit Shah on 27/08/2023  ---  This is use to get ticketId and make field border dotted on drag.
    // UPDATION - Updated By Nimit Shah on 23/8/2023   ---  --
    // CONDITION - Cleaned code
    // STATUS - DONE
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
            console.error('OUTPUT dragstart : ', error.message);
        }
    }

    dragover(event) {
        event.preventDefault();
    }

    // CREATION - Created By Nimit Shah on 27/08/2023  ---  This is use drop ticket on the fields and change ticket field.
    // UPDATION - Updated By Nimit Shah on 23/8/2023   ---  --
    // CONDITION - Cleaned code
    // STATUS - WORKING
    dropzone(event) {
        try {
            let fieldId = event.currentTarget.dataset.id;

            if (fieldId != this.fieldid) {
                this.boarddata = [];

                updateticketfield({ ticketId: this.ticketId, fieldId: fieldId })
                    .then(result => {

                    }).catch(error => {
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
            console.error('OUTPUT dropzone: ', (error.message));
        }
    }

    createticket() {
        try {
            if (this.isShowModal == false) {
                this.isShowModal = true;
                this.fieldid = this.boarddata[0].field.Id
            }
        } catch (error) {
            console.error('OUTPUT : ', error.message);
        }
    }

    handleticketaction(event) {
        try {
            var ticketrecord;
            // to perform some action to save or cancel ticket creation
            if (event.currentTarget.dataset.name == 'Save') {
                if (this.name == '' || this.number == '' || this.name.trim() == '' || this.number.trim() == '') {
                } else {
                    this.isShowModal = false;
                    ticketrecord = {
                        'sobjectType': 'Ticket__c'
                    };
                    ticketrecord['Name'] = this.name;
                    ticketrecord['Description__c'] = this.description;
                    ticketrecord['TicketNumber__c'] = this.number;
                    ticketrecord['StartDate__c'] = this.startdate;
                    ticketrecord['EndDate'] = this.enddate;
                    ticketrecord['TicketPriority__c'] = this.priority;
                    ticketrecord['Field__c'] = this.fieldid;
                    createticket({ newticket: ticketrecord })
                        .then(result => {
                            let newticket = [{
                                "Id": result.Id, "Field__c": result.Field__c, "Description__c": result.Description__c, "EndDate__c": result.EndDate__c, 'CreatedDate': result.CreatedDate,
                                "StartDate__c": result.StartDate__c, "Name": result.Name, "TicketNumber__c": result.TicketNumber__c, "TicketPriority__c": result.TicketPriority__c
                            }];
                            let tickets = [];
                            this.boarddata = [];
                            this.ticketlist.push(newticket[0]);
                            this.hfieldlist.forEach((field) => {
                                this.ticketlist.forEach((ticket) => {
                                    if (ticket.Field__c == field.Id) {
                                        tickets.push(ticket);
                                    }
                                })
                                this.boarddata.push({ "field": field, "ticket": tickets })
                                tickets = [];
                            })
                            this.fieldid = '';
                            this.name = '';
                            this.number = '';
                            this.description = '';
                            this.startdate = '';
                            this.enddate = '';
                            this.priority = '';
                        }).catch(error => {
                            console.error('OUTPUT : ', error.message);
                        });
                }
            }
            else if (event.currentTarget.dataset.name == 'SaveNew') {
                if (this.name == '' || this.number == '' || this.name.trim() == '' || this.number.trim() == '') {
                } else {
                    ticketrecord = {
                        'sobjectType': 'Ticket__c'
                    };
                    ticketrecord['Name'] = this.name;
                    ticketrecord['Description__c'] = this.description;
                    ticketrecord['TicketNumber__c'] = this.number;
                    ticketrecord['StartDate__c'] = this.startdate;
                    ticketrecord['EndDate'] = this.enddate;
                    ticketrecord['TicketPriority__c'] = this.priority;
                    ticketrecord['Field__c'] = this.fieldid;

                    createticket({ newticket: ticketrecord })
                        .then(result => {
                            let newticket = [{
                                "Id": result.Id, "Field__c": result.Field__c, "Description__c": result.Description__c, "EndDate__c": result.EndDate__c, 'CreatedDate': result.CreatedDate,
                                "StartDate__c": result.StartDate__c, "Name": result.Name, "TicketNumber__c": result.TicketNumber__c, "TicketPriority__c": result.TicketPriority__c
                            }];
                            let tickets = [];
                            this.boarddata = [];
                            this.ticketlist.push(newticket[0]);

                            this.hfieldlist.forEach((field) => {
                                this.ticketlist.forEach((ticket) => {
                                    if (ticket.Field__c == field.Id) {
                                        tickets.push(ticket);
                                    }
                                })
                                this.boarddata.push({ "field": field, "ticket": tickets })
                                tickets = [];
                            })

                            this.name = '';
                            this.number = '';
                            this.description = '';
                            this.startdate = '';
                            this.enddate = '';
                            this.priority = '';
                        })
                        .catch(error => {
                            console.error('OUTPUT : ', error.message);
                        });
                }
            } else if (event.currentTarget.dataset.name == 'Cancel') {
                this.isShowModal = false;
                this.name = '';
                this.number = '';
                this.description = '';
                this.startdate = '';
                this.enddate = '';
                this.priority = '';
            }
        } catch (error) {
            console.error('OUTPUT errors: ', error.message);
        }
    }


    handleinputaction(event) {
        try {
            if (event.currentTarget.dataset.name == 'Number') {
                this.number = event.target.value;
            } if (event.currentTarget.dataset.name == 'Name') {
                this.name = event.target.value;
            } else if (event.currentTarget.dataset.name == 'Description') {
                this.description = event.target.value;
            } else if (event.currentTarget.dataset.name == 'StartDate') {
                this.startdate = event.target.value;
            } else if (event.currentTarget.dataset.name == 'EndDate') {
                this.enddate = event.target.value;
            } else if (event.currentTarget.dataset.name == 'Priority') {
                this.priority = event.target.value;
            }
        } catch (error) {
            console.error('OUTPUT : ', error.message);
        }
    }

    disconnectedCallback() {
        this.fieldid = null;
        this.boardname = null;
        this.hboardid = null;
        this.hboardname = null;
        this.hfieldlist = null;
        this.ticketlist = null;
        this.hcommentlist = null;
        this.hboarduserrelationlist = null;
        this.huserlist = null;
        this.boarddata = [];
        this.ticketId = null;
        this.ticketName = null;
        window.removeEventListener('popstate', this.handlePopstate.bind(this));
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
            console.error('OUTPUT : ', error.message);
        }
    }

    handletemporarydeleteticket(event) {
        try {
            this.ticketId = event.detail;

            temporarydeleteticket({ ticketId: this.ticketId })
                .then(result => {

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
                    console.error(error.message);
                });

            this.openclosedeletepopup();
        } catch (error) {
            console.error(error.message);
        }
    }

    opendropdown(event) {
        if (event.detail.value == 'recycle') {
            console.log(event.detail.value);
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
            console.error('OUTPUT : ', error.message);
        }
    }

    restoreticket(event) {
        try {
            let ticketId = event.detail;
            let i;
            this.deletedticketlist.forEach((ticket, index) => {
                if (ticket.Id == ticketId) {
                    this.ticketlist.push(this.deletedticketlist.splice(index, 1)[0]);
                }
            })

            this.search(null);

        } catch (error) {
            console.error('OUTPUT : ', error.message);
        }
    }

    openticket(event) {
        try {
            if (this.deletemodal == false) {                             // Keep it so while click on delete it will not open ticketpopup
                if (this.openticketmodal == false) {
                    this.ticketlist.forEach(ticket => {
                        if (ticket.Id == event.currentTarget.dataset.id) {
                            this.ticketpopupdata = ticket;
                        }
                    });
                }
                this.openticketmodal = !this.openticketmodal;
            }
        } catch (error) {
            console.error('OUTPUT : ', error.message);
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
            console.error(error.message);
        }
    }
}