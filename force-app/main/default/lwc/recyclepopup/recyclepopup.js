import { LightningElement, api, track } from 'lwc';
import permanentdeleteticket from '@salesforce/apex/ViewBoard.permanentdeleteticket';
import permanentdeleteboard from '@salesforce/apex/HomePage.permanentdeleteboard';
import restoreticket from '@salesforce/apex/ViewBoard.restoreticket';
import restoreboard from '@salesforce/apex/HomePage.restoreboard';
import permanentdeletefield from '@salesforce/apex/FieldController.permanentdeletefield';

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

    handlepermanentdeleteaction() {
        try {
            if (this.type == 'Board') {
                this.handlepermanentdeleteboard();
            } else if (this.type == 'Ticket') {
                this.handlepermanentdeleteticket();
            } else if (this.type == 'Field') {
                this.handlepermanentdeletefield();
            }
        } catch (error) {
            console.error(error.message);
            this.spinnertable = false;
        }
    }

    openclosedeletepopup(event) {
        try {
            this.deletepopup = !this.deletepopup;
            if (this.deletepopup) {
                if (this.type == 'Board') {
                    this.deletetype = "permanentdeleteboard";
                } else if (this.type == 'Field') {
                    this.deletetype = "permanentdeletefield";
                } else if (this.type == 'Ticket') {
                    this.deletetype = "permanentdeleteticket";
                }

                this.boardname = event.currentTarget.dataset.name;
                this.boardid = event.currentTarget.dataset.id;
            }
        } catch (error) {
            console.error(error.message);
            this.spinnertable = false;
        }
    }

    handlecloserecycle() {
        try {
            const closerecycle = new CustomEvent("closerecycle", {
                detail: 'close'
            });
            this.dispatchEvent(closerecycle);
        } catch (error) {
            console.error(error.message);
            this.spinnertable = false;
            this.enqueueToast.push({ status: 'failed', message: 'FAILED TO CLOSE RECYCLEBIN' });
            this.toastprocess(null);
        }
    }

    handlepermanentdeleteboard() {
        try {
            permanentdeleteboard({ boardId: this.boardid })
                .then(() => {
                    const permanentdeleted = new CustomEvent("permanentdeleteboard", {
                        detail: this.boardid
                    });
                    this.dispatchEvent(permanentdeleted);
                    this.enqueueToast.push({ status: 'success', message: 'BOARD DELETED SUCCESSFULLY' });
                    this.toastprocess(null);
                }).catch(error => {
                    this.enqueueToast.push({ status: 'error', message: 'BOARD DELETE FAILED' });
                    this.toastprocess(null);
                    console.error('permanentdeleteBoard apex error :', (error.message));
                    this.spinnertable = false;
                });
            this.openclosedeletepopup();
        } catch (error) {
            console.error(error);
            this.spinnertable = false;
        }
    }

    handlepermanentdeleteticket() {
        try {
            permanentdeleteticket({ ticketId: this.boardid }) // boardid is ticket id here
                .then(() => {
                    this.enqueueToast.push({ status: 'success', message: 'TICKET DELETED SUCCESSFULLY' });
                    this.toastprocess(null);
                    const permanentdeleted = new CustomEvent("permanentdeleteticket", {
                        detail: this.boardid
                    });
                    this.dispatchEvent(permanentdeleted);
                }).catch(error => {
                    console.error(error.message);
                    this.spinnertable = false;
                    this.enqueueToast.push({ status: 'failed', message: 'TICKET DELETE FAILED' });
                    this.toastprocess(null);
                });
            this.openclosedeletepopup();
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    handlerestore(event) {
        try {
            if (this.type == 'Board') {
                /****************** This is use to restore the board ******************/
                this.handlerestoreboard(event);

            } else if (this.type == 'Ticket') {
                /****************** This is use to restore the ticket ******************/
                this.handlerestoreticket(event);
            } else if (this.type == 'Field') {
                /****************** This is use to restore the field ******************/
                this.handlerestorefield(event);
            }
        }
        catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

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
                    this.spinnertable = false;
                    console.error(error.message);
                    this.enqueueToast.push({ status: 'failed', message: 'BOARD RESTORE FAILED' });
                    this.toastprocess(null);
                });
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

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
                    });
                    this.dispatchEvent(closerecycle);
                }).catch(error => {
                    this.spinnertable = false;
                    console.error(error.message);
                });
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
            this.enqueueToast.push({ status: 'failed', message: 'TICKET RESTORE FAILED' });
            this.toastprocess(null);
        }
    }

    handlerestorefield(event) {
        try {
            let fieldId = event.currentTarget.dataset.id;
            this.enqueueToast.push({ status: 'success', message: 'FIELD RESTORED SUCCESSFULLY' });
            this.toastprocess(null);
            const closerecycle = new CustomEvent("restorefield", {
                detail: fieldId
            })
            this.dispatchEvent(closerecycle);
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
            this.enqueueToast.push({ status: 'failed', message: 'FIELD RESTORE FAILED' });
            this.toastprocess(null);
        }
    }

    handlepermanentdeletefield() {
        permanentdeletefield({ fieldid: this.boardid }) // boardid is field id here
            .then(() => {
                this.enqueueToast.push({ status: 'success', message: 'FIELD DELETED SUCCESSFULLY' });
                this.toastprocess(null);
                const permanentdeleted = new CustomEvent("permanentdeletefield", {
                    detail: this.boardid
                });
                this.dispatchEvent(permanentdeleted);
            }).catch(error => {
                this.spinnertable = false;
                console.error(error.message);
                this.enqueueToast.push({ status: 'failed', message: 'FIELD DELETE FAILED' });
                this.toastprocess(null);
            });
        this.openclosedeletepopup();
    }

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
            this.spinnertable = false;
            console.error(error.message);
        }
    }
}