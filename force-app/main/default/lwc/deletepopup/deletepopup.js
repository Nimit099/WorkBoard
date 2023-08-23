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
            console.log('OUTPUT : ', this.boardid);
            if (this.type == 'board') {
                this.showtype = "Board";
                this.notes = true;
            } else if (this.type == "restoreboard") {
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
            console.log('OUTPUT : ', error);
        }
    }
    handledeleteaction(event) {
        try {
            console.log('OUTPUT : ', event.currentTarget.dataset.name);
            if (event.currentTarget.dataset.type == "board") {
                if (event.currentTarget.dataset.name == "deleteyes") {
                    deleteboard({ boardId: this.boardid })
                        .then(result => {
                        }).catch(error => {
                            console.log(JSON.stringify(error));
                        })
                } else {
                    this.boardid = null;
                }
                const deleted = new CustomEvent("closedelete", {
                    detail: this.boardid
                });
                this.dispatchEvent(deleted);
            } else if (event.currentTarget.dataset.type == "restoreboard") {
                if (event.currentTarget.dataset.name == "deleteyes") {
                    const deleted = new CustomEvent("closedelete", {
                        detail: "deleteyes"
                    });
                    this.dispatchEvent(deleted);
                } else {
                    const deleted = new CustomEvent("closedelete", {
                        detail: "deleteno"
                    });
                    this.dispatchEvent(deleted);
                }
            } else if (event.currentTarget.dataset.type == "ticket") {
                if (event.currentTarget.dataset.name == "deleteyes") {
                    deleteticket({ ticketId: this.boardid })
                        .then(result => {
                            const deleted = new CustomEvent("closedelete", {
                                detail: "deleteyes"
                            });
                            this.dispatchEvent(deleted);
                        }).catch(error => {
                            console.log(JSON.stringify(error));
                        })
                } else {
                    console.log('OUTPUT : deleteno');
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

        } catch (error) {
            console.log('OUTPUT : ', error);
        }
    }
}