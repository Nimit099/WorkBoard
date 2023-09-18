import { LightningElement, api, track } from 'lwc';
import getFields from '@salesforce/apex/fieldController.getFields';
import createfield from '@salesforce/apex/fieldController.createfield';

export default class Field extends LightningElement {
    @api boardid;
    @api boardname;
    @track fieldsfound = false;
    @track fielddata = [];
    @track createField = false;

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
        } catch (error) {
            console.error(error.message);
        }
    }

    saveandnewfield(event) {
        try {
            console.log(this.fielddata.length);
            createfield({ field: event.detail, fieldcount: this.fielddata.length })
                .then(() => {

                }).catch(error => {
                    console.error('Method execution failed ' + error);
                });
        } catch (error) {
            console.error(error.message);
        }
    }
}