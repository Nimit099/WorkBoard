import { LightningElement, api, track } from 'lwc';
import deleteboard from '@salesforce/apex/HomePage.deleteboard';
import deleteticket from '@salesforce/apex/viewBoard.deleteticket';
export default class Deletepopup extends LightningElement {
    @api boardid;
    @api boardname;
    @api ticketid;
    @api ticketname;
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
                this.showtype = 'Ticket'
                this.notes = true;
            }
            else if (this.type == 'restoreticket') {
                this.showtype = 'Ticket'
                this.notes = false;
            }
        } catch (error) {
            console.error('OUTPUT : ', error.message);
        }
    }

    handledeleteaction(event) {
        try {
            
            if (this.showtype == 'Board') {
                this.handledeleteboard(event);
            } else if (this.showtype == 'Ticket') {
                if (event.currentTarget.dataset.type == "ticket") {
                    if (event.currentTarget.dataset.name == "deleteyes") {
                        deleteticket({ ticketId: this.boardid })
                            .then(result => {
                                const deleted = new CustomEvent("closedelete", {
                                    detail: "deleteyes"
                                });
                                this.dispatchEvent(deleted);
                            }).catch(error => {
                                console.error(error.message);
                            })
                    } else {
                        const deleted = new CustomEvent("closedelete", {
                            detail: "deleteno"
                        });
                        this.dispatchEvent(deleted);
                    }
                } else if (event.currentTarget.dataset.type == "restoreticket") {
                    if (event.currentTarget.dataset.name == "deleteyes") {
                        const deleted = new CustomEvent("closedelete", {
                            detail: "deleteyes"
                        });
                        this.dispatchEvent(deleted);
                    }
                    else {
                        const deleted = new CustomEvent("closedelete", {
                            detail: "deleteno"
                        });
                        this.dispatchEvent(deleted);
                    }
                }
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

    handledeleteticket() {

    }
}