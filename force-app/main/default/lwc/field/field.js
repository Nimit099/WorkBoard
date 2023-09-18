import { LightningElement, api, track } from 'lwc';
import getFields from '@salesforce/apex/fieldController.getFields';
import createfield from '@salesforce/apex/fieldController.createfield';

export default class Field extends LightningElement {
    @api boardid;
    @api boardname;
    @track fieldsfound = false;
    @track fielddata = [];
    @track createField = false;

    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;

    connectedCallback() {
        try {
            getFields({ boardId: this.boardid })
                .then(result => {
                    this.fielddata = result;
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
                    this.fielddata = [];
                    this.fielddata = result;
                }).catch(error => {
                    console.error('Method execution failed ' + error.message);
                });
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
}