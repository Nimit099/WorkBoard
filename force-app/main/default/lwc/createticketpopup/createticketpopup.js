import { LightningElement, api, track } from 'lwc';
import createticket from '@salesforce/apex/viewBoard.createticket';
export default class Createticketpopup extends LightningElement {
    get options() {
        return [
            { label: 'Low', value: 'Low' },
            { label: 'Medium', value: 'Medium' },
            { label: 'High', value: 'High' },
        ];
    }
    @api isShowModal;
    @api fieldid;
    @track name = '';
    @track number = '';
    @track description;
    @track enddate;
    @track startdate;
    @track priority;

    handleticketaction(event) {
        try {
            var ticketrecord;
            // to perform some action to save or cancel ticket creation
            if (event.currentTarget.dataset.name == 'Save') {

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
                ticketrecord['Color__c'] = '#FFFFFF';
                createticket({ newticket: ticketrecord })
                    .then(result => {
                        ticketrecord = result;
                        const sendticket = new CustomEvent("closemodal", {
                            detail: ticketrecord
                        });
                        this.dispatchEvent(sendticket);
                        ticketrecord = '';

                        const closeticket = new CustomEvent("closeticketmodal", {
                            detail: false
                        });
                        this.dispatchEvent(closeticket);
                    });


            } else if (event.currentTarget.dataset.name == 'SaveNew') {
                if (this.name == '' || this.number == '' || this.name.trim() == '' || this.number.trim() == '' ) {
                    this.template.querySelector('c-toast').showToast('error', 'Please fill required fields');
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
                            ticketrecord = result;

                            const sendticket = new CustomEvent("closemodal", {
                                detail: ticketrecord
                            });
                            this.dispatchEvent(sendticket);
                            ticketrecord = '';
                            const closeticket = new CustomEvent("closeticketmodal", {
                                detail: true
                            });
                            this.dispatchEvent(closeticket);
                        })
                        .catch(error => {
                            console.log('OUTPUT : ', error);
                            console.log('OUTPUT : ', error.message);
                        });
                }
            } else if (event.currentTarget.dataset.name == 'Cancel') {
                const closeticket = new CustomEvent("closeticketmodal", {
                    detail: false
                });
                this.dispatchEvent(closeticket);
            }

            this.name = '';
            this.number = '';
            this.description = '';
            this.startdate = '';
            this.enddate = '';
            this.psriority = '';
        } catch (error) {
            console.log('OUTPUT : ', error.message);
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
}