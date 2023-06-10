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

    handledeleteaction(event) {
        try {
            if (this.type == 'Board') {
                this.deletetype = "restoreboard";
                if (this.deletepopup == true) {
                    if (event.detail == 'deleteyes') {
                        permanentdeleteboard({ boardId: this.boardid })
                            .then(result => {
                                this.deletepopup = false;
                                this.template.querySelector('c-toast').showToast('success', 'BOARD DELETED SUCCESSFULLY');
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
                                this.template.querySelector('c-toast').showToast('success', 'TICKET DELETED SUCCESSFULLY');
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
                        this.template.querySelector('c-toast').showToast('success', 'BOARD RESTORED SUCCESSFULLY');
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
                        this.template.querySelector('c-toast').showToast('success', 'TICKET RESTORED SUCCESSFULLY');
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
}