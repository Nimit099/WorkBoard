import { LightningElement, api, track } from 'lwc';
import getTicket from '@salesforce/apex/viewBoard.getTicket';
export default class Ticketpopup extends LightningElement {

    @track ticketpopupdata;
    @api ticketid;
    @track ticketName;
    @track ticketNumber;
    @track ticketCreatedDate;
    @track ticketDescription = 'There is no Description.';
    @track ticketPriority = '-';
    @track ticketStartDate = '-';
    @track ticketEndDate = '-';
    @track ticketFieldName;
    @track ticketColor;
    @track ticketCompletedPercentage = 0;
    @track ticketLastmodifieddate = '';

    connectedCallback() {
        try {

            getTicket({ ticketId: this.ticketid })
                .then(result => {
                    this.ticketpopupdata = result;
                    this.ticketName = this.ticketpopupdata.Name;
                    this.ticketNumber = this.ticketpopupdata.TicketNumber__c;
                    this.ticketCreatedDate = this.ticketpopupdata.CreatedDate;
                    this.ticketFieldName = this.ticketpopupdata.Field__r.Name;
                    this.ticketColor = this.ticketpopupdata.Color__c;
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

                });
        } catch (error) {
            console.error(error.message);
        }

    }

    saveticketpopup() {
        this.closeticketpopup();
    }

    closeticketpopup() {
        const closeticketpopup = new CustomEvent("closeticketpopup", {
            detail: 'close'                                                 // return ticket data from here
        });
        this.dispatchEvent(closeticketpopup);
    }
}