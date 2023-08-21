import { LightningElement, api, track } from 'lwc';
import permanentdeleteboard from '@salesforce/apex/HomePage.permanentdeleteboard';
import permanentdeleteticket from '@salesforce/apex/viewBoard.permanentdeleteticket';
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

    handledeleteaction(event) {
        try {
            if (this.type == 'Board') {
                this.deletetype = "restoreboard";
                if (this.deletepopup == true) {
                    if (event.detail == 'deleteyes') {
                        permanentdeleteboard({ boardId: this.boardid })
                            .then(result => {
                                this.deletepopup = false;
                                this.enqueueToast.push({status:'success', message:'BOARD DELETED SUCCESSFULLY'});
                                this.toastprocess(null);
                                
                                const permanentdeleted = new CustomEvent("closerecycle", {
                                    detail: this.boardid
                                });
                                this.dispatchEvent(permanentdeleted);
                            }).catch(error => {
                                console.log('handledeleteaction apex error :', JSON.stringify(error));
                            })
                    } else {
                        this.deletepopup = false;
                    }
                } else {
                    this.boardname = event.currentTarget.dataset.name;
                    this.boardid = event.currentTarget.dataset.id;
                    this.deletepopup = true;
                }
            } else if (this.type == 'Ticket') {
                this.deletetype = "restoreticket";
                if (this.deletepopup == true) {
                    if (event.detail == 'deleteyes') {
                        permanentdeleteticket({ ticketId: this.boardid }) // boardid is ticket id here
                            .then(result => {
                                this.deletepopup = false;
                                this.enqueueToast.push({status:'success', message:'TICKET DELETED SUCCESSFULLY'});
                                this.toastprocess(null);
                                const permanentdeleted = new CustomEvent("closerecycle", {
                                    detail: this.boardid // boardid is ticket id here
                                });
                                this.dispatchEvent(permanentdeleted);
                            }).catch(error => {
                                console.log('handledeleteaction apex error :', JSON.stringify(error));
                            })
                    } else {
                        this.deletepopup = false;
                    }
                } else {
                    this.boardname = event.currentTarget.dataset.name;     // boardname is ticket name here
                    this.boardid = event.currentTarget.dataset.id;        // boardid is ticket id here
                    this.deletepopup = true;
                }

            }
        } catch (error) {
            console.log('OUTPUT handledeleteaction: ', error);
        }
    }

    handleclose() {
        try {
            if (this.type == 'Board') {
                const closerecycle = new CustomEvent("closerecycle", {
                    detail: 'close'
                });
                this.dispatchEvent(closerecycle);
            } else if (this.type == 'Ticket') {
                const closerecycle = new CustomEvent("closerecycle", {
                    detail: 'close'
                });
                this.dispatchEvent(closerecycle);
            }
        } catch (error) {
            console.log('OUTPUT handle close: ', error);
        }
    }

    handlerestoreboard(event) {
        try {
            if (this.type == 'Board') {
                this.boardid = event.currentTarget.dataset.id
                restoreboard({ boardId: this.boardid })
                    .then(result => {
                        this.enqueueToast.push({status:'success', message:'BOARD RESTORED SUCCESSFULLY'});
                        this.toastprocess(null);
                        const closerecycle = new CustomEvent("restoreboard", {
                            detail: this.boardid
                        });
                        this.dispatchEvent(closerecycle);
                    });
            } else if (this.type == 'Ticket') {
                let ticketId = event.currentTarget.dataset.id
                console.log('OUTPUT : ', ticketId);
                restoreticket({ ticketId: ticketId })
                    .then(result => {
                        console.log('OUTPUT : ', ticketId);
                        this.enqueueToast.push({status:'success', message:'TICKET RESTORED SUCCESSFULLY'});
                        this.toastprocess(null);
                        const closerecycle = new CustomEvent("restoreticket", {
                            detail: ticketId
                        });
                        this.dispatchEvent(closerecycle);
                    });
            }
        }
        catch (error) {
            console.log('OUTPUT handlerestoreboard : ', error);
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