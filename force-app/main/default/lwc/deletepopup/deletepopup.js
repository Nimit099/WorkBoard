import { LightningElement, api, track } from 'lwc';
export default class Deletepopup extends LightningElement {
    @api boardid;
    @api boardname;
    @api ticketid;
    @api ticketname;
    @api fieldid;
    @api fieldname
    @api type;
    @track showtype;
    @track notes;

    connectedCallback() {
        try {
            if (this.type == 'board') {
                this.showtype = "Board";
                this.notes = true;
            } else if (this.type == "permanentdeleteboard") {
                this.showtype = "Board";
                this.notes = false;
            } else if (this.type == 'ticket') {
                this.showtype = 'Ticket';
                this.notes = true;
            } else if (this.type == 'permanentdeleteticket') {
                this.showtype = 'Ticket';
                this.notes = false;
            } else if (this.type == 'field') {
                this.showtype = 'Field';
            } else if (this.type == 'permanentdeletefield') {
                this.showtype = 'Field';
            }
            console.log(this.type);
            console.log(this.showtype);
        } catch (error) {
            console.error('OUTPUT : ', error.message);
        }

    }

    handledeleteaction(event) {
        try {
            if (this.showtype == 'Board') {
                this.handledeleteboard(event);
            } else if (this.showtype == 'Ticket') {
                this.handledeleteticket(event);
            } else if (this.showtype = 'Field') {
                this.handledeletefield(event);
            }

        } catch (error) {
            console.error('OUTPUT : ', error.message);
        }
    }

    closedeletepopup() {

        // This is use for closing delete popup on everypage (currently) while clicking on cancel button
        const closedelete = new CustomEvent("closedeletepopup", {
            detail: 'closedelete'
        });
        this.dispatchEvent(closedelete);
    }

    handledeleteboard(event) {
        if (event.currentTarget.dataset.type == "board") {
            //*************** To temporarily delete the board  ***************//
            const deleted = new CustomEvent("temporaryboarddelete", {
                detail: this.boardid
            });
            this.dispatchEvent(deleted);

        } else if (event.currentTarget.dataset.type == "permanentdeleteboard") {
            //*************** To permanent delete the board  ***************//
            const deleted = new CustomEvent("permanentdeleteboard", {
                detail: "deleteyes"
            });
            this.dispatchEvent(deleted);

        }
    }

    handledeleteticket(event) {

        // Here boardid is ticketId

        if (event.currentTarget.dataset.type == "ticket") {
            const deleted = new CustomEvent("temporarydeleteticket", {
                detail: this.boardid
            });
            this.dispatchEvent(deleted);

        } else if (event.currentTarget.dataset.type == "permanentdeleteticket") {

            const deleted = new CustomEvent("permanentdeleteticket", {
                detail: "deleteyes"
            });
            this.dispatchEvent(deleted);
        }
    }

    handledeletefield(event) {
        console.log(event.currentTarget.dataset.type + ' handledeletefield');
        if (event.currentTarget.dataset.type == "field") {

            const deleted = new CustomEvent("temporarydeletefield", {
                detail: "deleteyes"
            });
            this.dispatchEvent(deleted);

        } else if (event.currentTarget.dataset.type == "permanentdeletefield") {

            const deleted = new CustomEvent("permanentdeletefield", {
                detail: "deleteyes"
            });
            this.dispatchEvent(deleted);
        }
    }
}