import { LightningElement, api, track } from 'lwc';
import permanentdeleteticket from '@salesforce/apex/viewBoard.permanentdeleteticket';
import permanentdeleteboard from '@salesforce/apex/HomePage.permanentdeleteboard';
import restoreticket from '@salesforce/apex/viewBoard.restoreticket';
import restoreboard from '@salesforce/apex/HomePage.restoreboard';
export default class Recyclepopup extends LightningElement {
    @api recyclelist = [];
    @api type;
    @track deletetype;
    @track boardid;
    @track boardname;
    @track deletepopup = false

    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;

    // CREATION - Created By Nimit Shah on 26/08/2023 --- This function is use to check who is calling and
    //  call function accordingly to permanently delete the board 
    // UPDATION - --
    // CONDITION - Cleaned code
    // STATUS - DONE
    handlepermanentdeleteaction(event) {
        try {
            if (this.type == 'Board') {
                this.handlepermanentdeleteboard();
            } else if (this.type == 'Ticket') {
                this.handlepermanentdeleteticket();
            }
        } catch (error) {
            console.error('OUTPUT handlepermanentdeleteaction: ', error.message);
        }
    }

    // CREATION - Created By Nimit Shah on 26/08/2023 --- This function is use to open the deletepopup when click on delete icon
    // and to close when delete popup either using custom event on delete popup(Click cancel) or delete the board permanently from 
    // handlepermanentdeleteaction form this component.
    // UPDATION - --
    // CONDITION - Cleaned code
    // STATUS - DONE
    openclosedeletepopup(event) {
        try {
            this.deletepopup = !this.deletepopup;
            if (this.deletepopup) {
                if (this.type == 'Board') {
                    this.deletetype = "permanentdeleteboard";
                } else {
                    this.deletetype = "permanentdeleteticket"; // left with the work of ticket.
                }
                this.boardname = event.currentTarget.dataset.name;
                this.boardid = event.currentTarget.dataset.id;
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    // CREATION - Created By Nimit Shah on 26/08/2023 --- This function is use to close recycle popup
    // UPDATION - --
    // CONDITION - Cleaned code
    // STATUS - DONE
    handlecloserecycle() {
        try {
            const closerecycle = new CustomEvent("closerecycle", {
                detail: 'close'
            });
            this.dispatchEvent(closerecycle);
        } catch (error) {
            console.error('OUTPUT handle close: ', error.message);
        }
    }

    // CREATION - Created By Nimit Shah on 26/08/2023 --- This function is use to permanently delete the board
    // UPDATION - --
    // CONDITION - Cleaned code
    // STATUS - DONE
    handlepermanentdeleteboard() {
        try {
            permanentdeleteboard({ boardId: this.boardid })
                .then(result => {
                    const permanentdeleted = new CustomEvent("permanentdeleteboard", {
                        detail: this.boardid
                    });
                    this.dispatchEvent(permanentdeleted);
                    this.enqueueToast.push({ status: 'success', message: 'BOARD DELETED SUCCESSFULLY' });
                    this.toastprocess(null);
                }).catch(error => {
                    this.enqueueToast.push({ status: 'error', message: 'BOARD DELETED FAILED' });
                    this.toastprocess(null);
                    console.error('permanentdeleteBoard apex error :', (error.message));
                })
            this.openclosedeletepopup();
        } catch (error) {
            console.error(error);
        }

    }

    // CREATION - Created By Nimit Shah on 26/08/2023 --- This function is use to permanently delete the ticket
    // UPDATION - --
    // CONDITION - Cleaned code
    // STATUS - WORKING
    handlepermanentdeleteticket(event) {
        try {
            permanentdeleteticket({ ticketId: this.boardid }) // boardid is ticket id here
                .then(result => {
                    this.enqueueToast.push({ status: 'success', message: 'TICKET DELETED SUCCESSFULLY' });
                    this.toastprocess(null);
                    const permanentdeleted = new CustomEvent("permanentdeleteticket", {
                        detail: this.boardid
                    });
                    this.dispatchEvent(permanentdeleted);
                }).catch(error => {
                    console.error('handlepermanentdeleteaction apex error :', JSON.stringify(error.message));
                });
            this.openclosedeletepopup();
        } catch (error) {
            console.error(error.message);
        }
    }

    // CREATION - Created By Nimit Shah on 26/08/2023 --- This function is use to check who is 
    // restoring and call function accordingly.
    // UPDATION - --
    // CONDITION - Cleaned code
    // STATUS - DONE
    handlerestore(event) {
        try {
            if (this.type == 'Board') {
                /****************** This is use to restore the board ******************/
                this.handlerestoreboard(event);

            } else if (this.type == 'Ticket') {
                /****************** This is use to restore the ticket ******************/
                this.handlerestoreticket(event);
            }
        }
        catch (error) {
            console.error('OUTPUT handlerestore : ', error.message);
        }
    }

    // CREATION - Created By Nimit Shah on 26/08/2023 --- This function is use to restore the board and also tell to homepage.
    // UPDATION - --
    // CONDITION - Cleaned code
    // STATUS - DONE
    handlerestoreboard(event) {
        /****************** This is use to restore the board ******************/
        try {
            this.boardid = event.currentTarget.dataset.id
            restoreboard({ boardId: this.boardid })
                .then(result => {
                    this.enqueueToast.push({ status: 'success', message: 'BOARD RESTORED SUCCESSFULLY' });
                    this.toastprocess(null);
                    const closerecycle = new CustomEvent("restoreboard", {
                        detail: this.boardid
                    });
                    this.dispatchEvent(closerecycle);
                }).catch(error => {
                    console.error(error.message);
                });
        } catch (error) {
            console.error(error.message);
        }
    }

    // CREATION - Created By Nimit Shah on 26/08/2023 --- This function is use to restore the ticket also tell to viewBoard.
    // UPDATION - --
    // CONDITION - Cleaned code
    // STATUS - WORKING
    handlerestoreticket(event) {
        /****************** This is use to restore the ticket ******************/
        try {
            let ticketId = event.currentTarget.dataset.id
            restoreticket({ ticketId: ticketId })
                .then(result => {
                    this.enqueueToast.push({ status: 'success', message: 'TICKET RESTORED SUCCESSFULLY' });
                    this.toastprocess(null);
                    const closerecycle = new CustomEvent("restoreticket", {
                        detail: ticketId
                    }).catch(error => {
                        console.error(error.message);
                    });
                    this.dispatchEvent(closerecycle);
                }).catch(error => {
                    console.error(error.message);
                });
        } catch (error) {
            console.error(error.message);
        }
    }

    // 21/8/2023 Created By Nimit Shah
    // This function is use to show toast on multiple calls
    // Multiple calls like I press two time save button on create board and it will generate two time red toast 
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
}