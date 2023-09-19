import { LightningElement, api, track } from 'lwc';
import getFields from '@salesforce/apex/fieldController.getFields';
import createfield from '@salesforce/apex/fieldController.createfield';
import temporarydeletefield from '@salesforce/apex/fieldController.temporarydeletefield';


import { NavigationMixin } from "lightning/navigation";

export default class Field extends NavigationMixin(LightningElement) {

    @api boardid;
    @api boardname;
    @track fieldsfound = false;
    @track fielddata = [];
    @track createField = false;
    @api home;
    @track deletemodal = false;
    @track fieldid;
    @track fieldname;
    @track deletedfield = [];
    @track allfields = [];
    @track today;
    @track isRecyclemodal = false;

    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;

    connectedCallback() {
        try {

            // This is use to get todays date 
            this.today = new Date();
            var dd = String(this.today.getDate()).padStart(2, '0');
            var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = this.today.getFullYear();
            this.today = yyyy + '-' + mm + '-' + dd;

            getFields({ boardId: this.boardid })
                .then(result => {

                    this.allfields = result;

                    this.allfields.forEach(element => {
                        if (element.DeletedDate__c == undefined) {
                            this.fielddata.push(element);
                        } else {
                            this.deletedfield.push(element);
                        }
                    });
                    if (this.fielddata.length > 0) {
                        this.fieldsfound = true;
                    }
                }).catch(error => {
                    console.error(error.message);
                });
        } catch (error) {
            console.error(error.message);
        }
    }

    openclosecreatefield() {
        this.createField = !this.createField;
    }

    savefield(event) {
        try {
            this.saveandnewfield(event);
            this.openclosecreatefield();
            this.enqueueToast.push({ status: 'success', message: 'TICKET CREATED SUCCESSFULLY' });
            this.toastprocess(null);

        } catch (error) {
            console.error(error.message);
        }
    }

    saveandnewfield(event) {
        try {

            let field = JSON.parse(JSON.stringify(event.detail));

            createfield({ field: field, boardid: this.boardid })
                .then(result => {
                    console.log(JSON.parse(JSON.stringify(result)));
                    this.allfields = result;
                    this.fielddata = [];
                    this.deletedfield = [];

                    this.allfields.forEach(element => {
                        if (element.DeletedDate__c == undefined) {
                            this.fielddata.push(element);
                        } else {
                            this.deletedfield.push(element);
                        }
                    });
                }).catch(error => {
                    console.error('Method execution failed ' + error.message);
                });
        } catch (error) {
            console.error(error.message);
        }
    }

    backhome() {
        try {
            let cmpDef = {
                componentDef: "c:home",
            };
            let encodedDef = btoa(JSON.stringify(cmpDef));
            this[NavigationMixin.Navigate]({
                type: "standard__webPage",
                attributes: {
                    url: "/one/one.app#" + encodedDef
                }
            });
        } catch (error) {
            console.error(error);
            console.error(error.message);
        }
    }

    openclosedeletepopup(event) {
        try {
            if (event != null) {
                this.fieldid = event.currentTarget.dataset.id;
                this.fieldname = event.currentTarget.dataset.name;
            }
            this.deletemodal = !this.deletemodal;

        } catch (error) {
            console.error(error.message);
        }
    }

    handletemporarydeletefield(event) {
        try {

            temporarydeletefield({ fieldid: this.fieldid, boardid: this.boardid })
                .then(result => {

                    this.fielddata = [];
                    this.deletedfield = [];

                    this.allfields = result;
                    this.allfields.forEach(element => {
                        if (element.DeletedDate__c == undefined) {
                            this.fielddata.push(element);
                        } else {
                            this.deletedfield.push(element);
                        }
                    });
                    this.openclosedeletepopup(null);
                }).catch(error => {
                    console.error(error.message);
                });
        } catch (error) {
            console.error(error.message);
        }
    }

    opencloserecyclepopup() {
        this.isRecyclemodal = !this.isRecyclemodal;
    }

    permanentdeletefield(event) {
        console.log('permanentdeletefield ' + event.detail);
        this.fielddata = [];
        this.deletedfield = [];
        this.allfields.forEach((element, index) => {
            if (element.Id != event.detail) {
                if (element.DeletedDate__c == undefined) {
                    this.fielddata.push(element);
                } else {
                    this.deletedfield.push(element);
                }
            } else {
                this.allfields.splice(index, 1);
            }
        });
        console.log(JSON.parse(JSON.stringify(this.allfields)));
        console.log(JSON.parse(JSON.stringify(this.deletedfield)));

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
}