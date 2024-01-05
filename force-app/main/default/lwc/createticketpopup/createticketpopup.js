import { LightningElement, api, track } from 'lwc';
export default class Createticketpopup extends LightningElement {
    get options() {
        return [
            { label: 'Low', value: 'Low' },
            { label: 'Medium', value: 'Medium' },
            { label: 'High', value: 'High' },
        ];
    }

    @api name = '';
    @api number = '';
    @api description;
    @api enddate;
    @api startdate;
    @api priority;
    @api field = '';
    @api color;
    @api progress;
    @api fields;
    @api isupdateticket = false;
    @track today;

    @track fieldList = [];


    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;

    connectedCallback() {
        try {

            this.fields.forEach(field => {
                this.fieldList.push({ label: field.Name, value: field.Id });
            });

            this.today = new Date();
            var dd = String(this.today.getDate()).padStart(2, '0');
            var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = this.today.getFullYear();
            this.today = yyyy + '-' + mm + '-' + dd;
        } catch (error) {
            console.error(error.message);
        }
    }

    handleinput(event) {
        if (event.currentTarget.dataset.name == 'number') {
            this.number = event.target.value;
        } else if (event.currentTarget.dataset.name == 'name') {
            this.name = event.target.value;
        } else if (event.currentTarget.dataset.name == 'field') {
            this.field = event.target.value;
        } else if (event.currentTarget.dataset.name == 'priority') {
            this.priority = event.target.value;
        } else if (event.currentTarget.dataset.name == 'startdate') {
            this.startdate = event.target.value;
        } else if (event.currentTarget.dataset.name == 'enddate') {
            this.enddate = event.target.value;
        } else if (event.currentTarget.dataset.name == 'color') {
            this.color = event.target.value;
        } else if (event.currentTarget.dataset.name == 'progress') {
            this.progress = event.target.value;
        } else if (event.currentTarget.dataset.name == 'description') {
            this.description = event.target.value;
        }
    }

    saveticket(event) {
        try {

            let ticketrecord = {
                'sobjectType': 'Ticket__c'
            };
            ticketrecord['Id'] = '';
            ticketrecord['Name'] = this.name;
            ticketrecord['Description__c'] = this.description;
            ticketrecord['TicketNumber__c'] = this.number;
            ticketrecord['StartDate__c'] = this.startdate;
            ticketrecord['EndDate__c'] = this.enddate;
            ticketrecord['TicketPriority__c'] = this.priority;
            ticketrecord['Field__c'] = this.field;
            ticketrecord['Color__c'] = this.color;
            ticketrecord['CompletedPercentage__c'] = this.progress;
            if (this.isupdateticket) {
                ticketrecord['LastModifiedDate'] = this.today;
            } else {
                ticketrecord['CreatedDate'] = this.today;
            }

            if (!this.isupdateticket) {
                if ((this.number != '' || this.number.trim() != '') && (this.name != '' || this.name.trim() != '')
                    && (this.field != '' || this.field.trim() != '')) {

                    if (event.currentTarget.dataset.name == 'Save') {

                        const dispatch = new CustomEvent("saveticket", {
                            detail: ticketrecord
                        })
                        this.dispatchEvent(dispatch);

                    } else if (event.currentTarget.dataset.name == 'SaveNew') {

                        const dispatch = new CustomEvent("savenewticket", {
                            detail: ticketrecord
                        })
                        this.dispatchEvent(dispatch);
                    }

                    this.number = '';
                    this.name = '';
                    this.description = '';
                    this.color = '';
                    this.startdate = '';
                    this.enddate = '';
                    this.field = '';
                    this.priority = '';
                    this.progress = '';
                } else {
                    this.enqueueToast.push({ status: 'error', message: 'PLEASE FILL REQUIRED FIELD' });
                    this.toastprocess(null);
                }
            } else {
                const updateticket = new CustomEvent("updateticket", {
                    detail: ticketrecord
                })
                this.dispatchEvent(updateticket);
            }

        } catch (error) {
            console.error(error.message);
        }

    }

    closeticket() {
        try {
            this.number = '';
            this.name = '';
            this.description = '';
            this.color = '';
            this.startdate = '';
            this.enddate = '';
            this.field = '';
            this.priority = '';
            this.progress = '';
            const dispatch = new CustomEvent("closeticket", {
                detail: 'onetoastdone'
            })
            this.dispatchEvent(dispatch);
        } catch (error) {
            console.error(error.message);
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

    @api createtickettoast(event) {
        if (event == 'success') {
            this.enqueueToast.push({ status: 'success', message: 'TICKET CREATED SUCCESSFULLY' });
            this.toastprocess(null);
        } else {
            this.enqueueToast.push({ status: 'failed', message: 'TICKET CREATE FAILED' });
            this.toastprocess(null);
        }
    }
}