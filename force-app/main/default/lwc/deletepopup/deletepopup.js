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

    // CREATION - Created By Nimit Shah on 12/08/2023 --- This is use to show delete popup
    // UPDATION - Updated By Nimit Shah on 23/08/2023 --- Make it lighter and furnish the code
    // CONDITION - Not cleaned code
    // STATUS - Working
    connectedCallback() {
        try {
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
            if (event.currentTarget.dataset.type == "board") {
                
                this.temporarydeleteboard(event);
                
            } else if (event.currentTarget.dataset.type == "restoreboard") {

                this.permanentdeleteboard(event);

            } else if (event.currentTarget.dataset.type == "ticket") {
                
                this.temporarydeleteticket(event);

            } else if (event.currentTarget.dataset.type == "restoreticket") {

                this.permanentdeleteticket(); 

            }

        } catch (error) {
            console.log('OUTPUT : ', error);
        }
    }

    temporarydeleteboard(event) {
        if (event.currentTarget.dataset.name != "deleteyes") {
            // deleteboard({ boardId: this.boardid })
            //     .then(result => {
            //     }).catch(error => {
            //         console.log(JSON.stringify(error));
            //     })
            this.boardid = null;
        }
        
        const deleted = new CustomEvent("closedelete", {
            detail: this.boardid
        });
        this.dispatchEvent(deleted);
    }

    permanentdeleteboard(event) {
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
    }

    temporarydeleteticket(event) {
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
    }

    permanentdeleteticket(event){
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