import { LightningElement, api, track } from 'lwc';
import updatetickets from '@salesforce/apex/viewBoard.updateticket';
import createticket from '@salesforce/apex/viewBoard.createticket';
import { NavigationMixin } from "lightning/navigation";
export default class ViewBoard extends NavigationMixin(LightningElement) {

    @api hboardid;
    @api hboardname;
    @api hfieldlist = [];
    @api hticketlist = [];
    @api hcommentlist;
    @api hboarduserrelationlist;
    @api huserlist;

    @track today;
    @track fieldid;
    @track boarddata = [];
    @track ticketId;
    @track ticketName;
    @track ticketlist = [];
    @track deletedticketlist = [];
    @track searchkey;


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
    @track toast1 = false;
    @track toast2 = false;
    @track deletemodal = false;
    @track ticketpopupdata;


    connectedCallback() {
        try {

            window.addEventListener('popstate', this.handlePopstate.bind(this));

            this.today = new Date();
            var dd = String(this.today.getDate()).padStart(2, '0');
            var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = this.today.getFullYear();
            this.today = yyyy + '-' + mm + '-' + dd;


            if (JSON.parse(sessionStorage.getItem(this.hboardid + 'ticketlist'))) {
                this.ticketlist = JSON.parse(sessionStorage.getItem(this.hboardid + 'ticketlist'));
                this.deletedticketlist = JSON.parse(sessionStorage.getItem(this.hboardid + 'deletedticketlist'));
            } else {
                this.hticketlist.forEach(ticket => {
                    if (ticket.DeletedDate__c == undefined) {
                        this.ticketlist.push(ticket);
                    } else {
                        this.deletedticketlist.push(ticket);
                    }
                });
                sessionStorage.setItem(this.hboardid + 'ticketlist', JSON.stringify(this.ticketlist));
                sessionStorage.setItem(this.hboardid + 'deletedticketlist', JSON.stringify(this.deletedticketlist));
            }

            if (this.hfieldlist.length > 0) {
                this.fieldsfound = true;
            }

            console.log('OUTPUT : ', JSON.stringify(this.ticketlist));

            var tickets = [];
            this.hfieldlist.forEach((field) => {
                this.ticketlist.forEach((ticket) => {
                    if (ticket.Field__c == field.Id) {
                        tickets.push(ticket);
                    }
                })
                this.boarddata.push({ "field": field, "ticket": tickets })
                tickets = [];
            })
        } catch (error) {
            console.log('OUTPUT viewBoard connected: ', error.message);
        }
    }

    renderedCallback() {
        try {

            if (this.ticketlist != null) {
                this.ticketlist.forEach(ticket => {
                    this.template.querySelector("div[data-id =" + ticket.Id + "]").style.background = ticket.Color__c;
                });
            }
        } catch (e) {
            console.error(e.message);
        }
    }


    dragover(event) {
        event.preventDefault();
    }



    dropzone(event) {
        try {
            this.boarddata = [];
            var fieldId = event.currentTarget.dataset.id;
            var tickets = [];
            var updateticket;
            let tempticket = [];

            this.hfieldlist.forEach((field) => {
                this.ticketlist.forEach((ticket) => {
                    if (ticket.Id == this.ticketId) {
                        if (field.Id == fieldId) {
                            if (fieldId != ticket.Field__c) {
                                updatetickets({ ticketId: this.ticketId, fieldId: fieldId })
                                    .then(result => { });
                            }
                            updateticket = [{
                                "Id": ticket.Id, "Field__c": fieldId, "CompletedPercentage__c": ticket.CompletedPercentage__c, "DeletedDate__c": ticket.DeletedDate__c,
                                "Description__c": ticket.Description__c, "EndDate__c": ticket.EndDate__c, "StartDate__c": ticket.StartDate__c, "Name": ticket.Name,
                                "TicketNumber__c": ticket.TicketNumber__c, "TicketPriority__c": ticket.TicketPriority__c, "Users__c": ticket.Users__c, "CreatedDate__c": ticket.CreatedDate__c
                            }];
                            tempticket.push(updateticket[0]);
                            tickets.push(updateticket[0]);
                        }
                    } else {
                        if (field.Id == ticket.Field__c) {
                            tempticket.push(ticket);
                            tickets.push(ticket);
                        }
                    }
                })
                this.boarddata.push({ "field": field, "ticket": tickets })
                tickets = [];
            })
            this.ticketlist = tempticket;

            this.template.querySelector('c-home').handletickets('update', updateticket);
            sessionStorage.clear();
            sessionStorage.setItem(this.hboardid + 'ticketlist', JSON.stringify(this.ticketlist));
            let arr = this.template.querySelectorAll('.fieldbody');
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i];
                element.style = 'border:none;';
            }

        } catch (error) {
            console.log('OUTPUT dropzone: ', (error.message));
        }
    }


    dragstart(event) {
        try {
            let arr = this.template.querySelectorAll('.fieldbody');
            for (let i = 0; i < arr.length; i++) {
                const element = arr[i];
                element.style = 'border:dotted;';
            }
            this.ticketId = event.currentTarget.dataset.id;
        } catch (error) {
            console.log('OUTPUT dragstart : ', error.message);
        }
    }


    createticket() {
        try {
            if (this.isShowModal == false) {
                this.isShowModal = true;
                this.toast1 = false;
                this.toast2 = true;
                this.fieldid = this.boarddata[0].field.Id
            }
        } catch (error) {
            console.log('OUTPUT : ', error.message);
        }
    }

    handleticketaction(event) {
        try {
            var ticketrecord;
            // to perform some action to save or cancel ticket creation
            if (event.currentTarget.dataset.name == 'Save') {
                if (this.name == '' || this.number == '' || this.name.trim() == '' || this.number.trim() == '') {
                    this.toast2 = true;
                    this.template.querySelector('c-toast').showToast('error', 'Please fill required details');
                } else {
                    this.isShowModal = false;
                    this.toast1 = true;
                    this.toast2 = false;
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
                                "Id": result.Id, "Field__c": result.Field__c, "Description__c": result.Description__c, "EndDate__c": result.EndDate__c, 'CreatedDate__c': result.CreatedDate__c,
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
                            sessionStorage.clear();
                            sessionStorage.setItem(this.hboardid + 'ticketlist', JSON.stringify(this.ticketlist));
                            this.fieldid = '';
                            this.name = '';
                            this.number = '';
                            this.description = '';
                            this.startdate = '';
                            this.enddate = '';
                            this.priority = '';
                            this.template.querySelector('c-home').handletickets('create', newticket);
                            this.template.querySelector('c-toast').showToast('success', 'Ticket Created successfully');
                            setTimeout(() => {
                                this.toast1 = false;
                                this.toast2 = false;
                            }, 4000);
                        }).catch(error => {
                            console.log('OUTPUT : ', error.message);
                        });
                }
            }
            else if (event.currentTarget.dataset.name == 'SaveNew') {
                if (this.name == '' || this.number == '' || this.name.trim() == '' || this.number.trim() == '') {
                    this.toast2 = true;
                    this.template.querySelector('c-toast').showToast('error', 'Please fill required details');
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
                                "Id": result.Id, "Field__c": result.Field__c, "Description__c": result.Description__c, "EndDate__c": result.EndDate__c, 'CreatedDate__c': result.CreatedDate__c,
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

                            sessionStorage.clear();
                            sessionStorage.setItem(this.hboardid + 'ticketlist', JSON.stringify(this.ticketlist));
                            this.name = '';
                            this.number = '';
                            this.description = '';
                            this.startdate = '';
                            this.enddate = '';
                            this.priority = '';
                            this.toast2 = true;
                            this.template.querySelector('c-home').handletickets('create', newticket);
                            this.template.querySelector('c-toast').showToast('success', 'Ticket Created successfully');
                        })
                        .catch(error => {
                            console.log('OUTPUT : ', error.message);
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
                this.toast2 = false;
                this.toast1 = false;
            }
        } catch (error) {
            console.log('OUTPUT errors: ', error.message);
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
            console.log('OUTPUT : ', error.message);
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
        sessionStorage.clear();
        window.removeEventListener('popstate', this.handlePopstate.bind(this));
    }

    handlePopstate() {
        // Perform any necessary cleanup or actions when the user navigates back
        this.disconnectedCallback();
    }

    deleteticket(event) {
        try {
            console.log('OUTPUT : ', event.currentTarget.dataset.type);
            if (this.deletemodal == false) {
                this.ticketId = event.currentTarget.dataset.id;
                this.ticketName = event.currentTarget.dataset.name;
                this.deletemodal = true;
                this.toast1 = true;
            } else {
                let deleteticket = [];
                if (event.detail == 'deleteyes') {
                    this.boarddata = [];
                    let tickets = [];

                    this.ticketlist.forEach((ticket, index) => {
                        if (ticket.Id != this.ticketId) {
                            tickets.push(ticket);
                        } else {
                            deleteticket = [{
                                "Id": ticket.Id, "Field__c": ticket.Field__c, "CompletedPercentage__c": ticket.CompletedPercentage__c, "DeletedDate__c": ticket.DeletedDate__c,
                                "Description__c": ticket.Description__c, "EndDate__c": ticket.EndDate__c, "StartDate__c": ticket.StartDate__c, "Name": ticket.Name, "DeletedDate__c": this.today,
                                "TicketNumber__c": ticket.TicketNumber__c, "TicketPriority__c": ticket.TicketPriority__c, "Users__c": ticket.Users__c, "CreatedDate__c": ticket.CreatedDate__c
                            }];
                            this.deletedticketlist.push(deleteticket[0]);
                        }
                    })
                    this.template.querySelector('c-home').handletickets('delete', deleteticket);
                    this.ticketlist = tickets;
                    tickets = [];
                    if (this.toast1 == true) {
                        this.template.querySelector('c-toast').showToast('success', 'Ticket deleted successfully');
                        setTimeout(() => {
                            this.toast1 = false;
                        }, 4000);
                    }

                    this.hfieldlist.forEach((field) => {
                        this.ticketlist.forEach((ticket) => {
                            if (ticket.Field__c == field.Id) {
                                tickets.push(ticket);
                            }
                        })
                        this.boarddata.push({ "field": field, "ticket": tickets })
                        tickets = [];
                    })
                    sessionStorage.clear();
                    sessionStorage.setItem(this.hboardid + 'ticketlist', JSON.stringify(this.ticketlist));
                    sessionStorage.setItem(this.hboardid + 'deletedticketlist', JSON.stringify(this.deletedticketlist));
                    this.ticketId = '';
                    this.ticketName = '';
                    this.deletemodal = false;

                } else if (event.detail == 'deleteno') {
                    this.ticketId = '';
                    this.ticketName = '';
                    this.deletemodal = false;
                }
            }
        } catch (error) {
            console.log('OUTPUT : ', error.message);
        }
    }

    search(event) {
        try {
            this.searchkey = event.target.value;
            let tickets = [];
            this.boarddata = [];
            if (this.searchkey.trim() != '') {
                this.hfieldlist.forEach((field) => {
                    this.ticketlist.forEach((ticket) => {
                        if (ticket.Field__c == field.Id) {
                            if (ticket.Name.toLowerCase().includes(this.searchkey.toLowerCase())) {
                                tickets.push(ticket);
                            } else if (ticket.TicketNumber__c.toLowerCase().includes(this.searchkey.toLowerCase())) {
                                tickets.push(ticket);
                            }
                        }
                    })
                    this.boarddata.push({ "field": field, "ticket": tickets })
                    tickets = [];
                })
            } else {
                this.hfieldlist.forEach((field) => {
                    this.ticketlist.forEach((ticket) => {
                        if (ticket.Field__c == field.Id) {
                            tickets.push(ticket);
                        }
                    })
                    this.boarddata.push({ "field": field, "ticket": tickets })
                    tickets = [];
                })

            }
        } catch (error) {
            console.log('OUTPUT : ', error.message);
        }
    }

    recycleaction(event) {
        try {
            // if (this.isRecyclemodal == false) {

            // } else {
            if (this.isRecyclemodal != false) {
                if (event.detail == 'close') {
                    this.isRecyclemodal = false;
                } else {
                    let i;
                    let ticketId = event.detail;
                    this.deletedticketlist.forEach((ticket, index) => {
                        if (ticket.Id == ticketId) {
                            i = index;
                        }
                    })
                    let deleteticket = this.deletedticketlist.splice(i, 1);
                    sessionStorage.setItem(this.hboardid + 'deletedticketlist', JSON.stringify(this.deletedticketlist));

                    this.template.querySelector('c-home').handletickets('permanentdelete', deleteticket);
                }
            }
            this.isRecyclemodal = !this.isRecyclemodal;
        } catch (error) {
            console.log('OUTPUT : ', error.message);
        }
    }

    restoreticket(event) {
        try {
            let ticketId = event.detail;
            let i;
            this.deletedticketlist.forEach((ticket, index) => {
                if (ticket.Id == ticketId) {
                    i = index;
                }
            })

            let restoreticket = this.deletedticketlist.splice(i, 1);
            this.ticketlist.push(restoreticket[0]);

            sessionStorage.setItem(this.hboardid + 'ticketlist', JSON.stringify(this.ticketlist));
            sessionStorage.setItem(this.hboardid + 'deletedticketlist', JSON.stringify(this.deletedticketlist));

            this.boarddata = [];
            let tickets = [];

            this.hfieldlist.forEach((field) => {
                this.ticketlist.forEach((ticket) => {
                    if (ticket.Field__c == field.Id) {
                        tickets.push(ticket);
                    }
                })
                this.boarddata.push({ "field": field, "ticket": tickets })
                tickets = [];
            })

        } catch (error) {
            console.log('OUTPUT : ', error.message);
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

}