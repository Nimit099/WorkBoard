import { LightningElement, api, track } from 'lwc';
import getTicket from '@salesforce/apex/viewBoard.getTicket';
import updateticket from '@salesforce/apex/viewBoard.updateticket';

export default class Ticketpopup extends LightningElement {

    @track ticketpopupdata;
    @track isupdateticket = false;
    @api ticketid;
    @track ticketName;
    @track ticketNumber;
    @track ticketCreatedDate;
    @track ticketDescription = 'There is no Description.';
    @track ticketPriority;
    @track ticketStartDate;
    @track ticketEndDate;
    @track ticketFieldName;
    @track ticketFieldId;
    @track ticketColor;
    @track ticketCompletedPercentage = 0;
    @track ticketLastmodifieddate = '';
    @api fields;

    connectedCallback() {
        try {
            getTicket({ ticketId: this.ticketid })
                .then(result => {
                    this.ticketpopupdata = result;
                    this.assignvalue();
                    console.log(['getticket']);
                });
        } catch (error) {
            console.error(error.message);
        }

    }

    editticketpopup() {
        try {
            this.isupdateticket = !this.isupdateticket;
        } catch (error) {
            console.error('editticketpopup', error.message);
        }
    }

    updateticket(event) {
        try {
            let ticket = JSON.parse(JSON.stringify(event.detail));
            ticket.Id = this.ticketid;
            updateticket({ newticket: ticket })
                .then(result => {
                    this.ticketpopupdata = ticket;
                    this.assignvalue();
                    this.editticketpopup();
                }).catch(error => {
                    console.error('updateticketmethodcall', error);
                });
        } catch (error) {
            console.error('updateticket', error.message);
        }
    }

    closeticketpopup() {
        try {
            const closeticketpopup = new CustomEvent("closeticketpopup", {
                detail: 'close'                                                
            });
            this.dispatchEvent(closeticketpopup);
        } catch (error) {
            console.error(error.message);
        }
    }

    assignvalue() {
        try {

            this.ticketName = this.ticketpopupdata.Name;
            this.ticketNumber = this.ticketpopupdata.TicketNumber__c;

            if (this.ticketpopupdata.Field__r != undefined) {
                this.ticketFieldName = this.ticketpopupdata.Field__r.Name;
                this.ticketFieldId = this.ticketpopupdata.Field__r.Id;
            }

            if (this.ticketpopupdata.Color__c != undefined)
                this.ticketColor = this.ticketpopupdata.Color__c;

            if (this.ticketpopupdata.CreatedDate != undefined)
                this.ticketCreatedDate = this.ticketpopupdata.CreatedDate;

            if (this.ticketpopupdata.LastModifiedDate != undefined)
                this.ticketLastmodifieddate = this.ticketpopupdata.LastModifiedDate;

            if (this.ticketpopupdata.Description__c != undefined)
                this.ticketDescription = this.ticketpopupdata.Description__c;

            if (this.ticketpopupdata.TicketPriority__c != undefined)
                this.ticketPriority = this.ticketpopupdata.TicketPriority__c;

            if (this.ticketpopupdata.StartDate__c != undefined)
                this.ticketStartDate = this.ticketpopupdata.StartDate__c;

            if (this.ticketpopupdata.EndDate__c != undefined)
                this.ticketEndDate = this.ticketpopupdata.EndDate__c;

            if (this.ticketpopupdata.CompletedPercentage__c != undefined)
                this.ticketCompletedPercentage = this.ticketpopupdata.CompletedPercentage__c;

        } catch (error) {
            console.error(error.message);
        }
    }
}