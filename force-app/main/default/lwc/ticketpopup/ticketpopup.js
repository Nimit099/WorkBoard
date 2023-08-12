import { LightningElement, api, track } from 'lwc';
export default class Ticketpopup extends LightningElement {

    @api ticketpopupdata;
    @track ticketId;
    @track ticketName;
    @track ticketNumber;
    @track ticketCreatedDate;
    @track ticketDescription = 'There is no Description.';
    @track ticketPriority = '-';
    @track ticketStartDate = '-';
    @track ticketEndDate = '-';
    @track ticketFieldName;
    @track ticketUser = '-';
    @track ticketColor;
    @track ticketCompletedPercentage = 0;
    @track ticketLastmodifieddate = '';

    @track isupdateticketNumber = false;
    @track isupdateticketPriority = false;
    @track isupdateticketName = false;
    @track isupdateticketCompletedPercentage = false;
    @track isupdateticketColor = false;
    @track isupdateticketEndDate = false;
    @track isupdateticketStartDate = false;
    @track isupdateticketDescription = false;


    connectedCallback() {
        console.log('OUTPUT : ', JSON.stringify(this.ticketpopupdata));

        this.ticketId = this.ticketpopupdata.Id;
        this.ticketName = this.ticketpopupdata.Name;
        this.ticketNumber = this.ticketpopupdata.TicketNumber__c;
        this.ticketCreatedDate = this.ticketpopupdata.CreatedDate__c;
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

        if (this.ticketpopupdata.Users__c != undefined)
            this.ticketUser = this.ticketpopupdata.Users__c;

        if (this.ticketpopupdata.CompletedPercentage__c != undefined)
            this.ticketCompletedPercentage = this.ticketpopupdata.CompletedPercentage__c;



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

    updatingTicket(event) {
        if (event.currentTarget.dataset.name == 'ticketNumber') {
            this.isupdateticketNumber = true;
        } else if (event.currentTarget.dataset.name == 'ticketPriority') {
            this.isupdateticketPriority = true;
        } else if (event.currentTarget.dataset.name == 'ticketName') {
            this.isupdateticketName = true;
        } else if (event.currentTarget.dataset.name == 'ticketCompletedPercentage') {
            this.isupdateticketCompletedPercentage = true;
        } else if (event.currentTarget.dataset.name == 'ticketColor') {
            this.isupdateticketColor = true;
        } else if (event.currentTarget.dataset.name == 'ticketEndDate') {
            this.isupdateticketEndDate = true;
        } else if (event.currentTarget.dataset.name == 'ticketStartDate') {
            this.isupdateticketStartDate = true;
        } else if (event.currentTarget.dataset.name == 'ticketDescription') {
            this.isupdateticketDescription = true;
        }
    }
}