import { LightningElement, track, api } from 'lwc';

export default class CreateField extends LightningElement {
    @api boardid;
    @track fieldName;
    @track fieldOrder;

    handleinput(event) {
        try {
            if (event.currentTarget.dataset.name == 'fieldname') {
                this.fieldName = event.target.value;
            } else if (event.currentTarget.dataset.name == 'fieldorder') {
                this.fieldOrder = event.target.value;
            }
        } catch (error) {
            console.error(error.message);
        }
    }


    createField() {
        try {
            let fieldrecord = {
                'sobjectType': 'Fields__c'
            };
            fieldrecord['Name'] = this.fieldName;
            fieldrecord['OrderNumber__c'] = this.fieldOrder;
            fieldrecord['Board__c'] = this.boardid;

            const dispatch = new CustomEvent("savefield", {
                detail: fieldrecord
            })
            this.dispatchEvent(dispatch);

        } catch (error) {
            console.error(error.message);
        }
    }

    saveandnewfield() {
        try {
            let fieldrecord = {
                'sobjectType': 'Fields__c'
            };
            fieldrecord['Name'] = this.fieldName;
            fieldrecord['OrderNumber__c'] = this.fieldOrder;
            fieldrecord['Board__c'] = this.boardid;

            const dispatch = new CustomEvent("saveandnewfield", {
                detail: fieldrecord
            })
            this.dispatchEvent(dispatch);

            this.fieldName = '';
            this.fieldOrder = '';

        } catch (error) {
            console.error(error.message);
        }
    }

    closeField() {
        try {
            const dispatch = new CustomEvent("closefield", {
                detail: null
            })
            this.dispatchEvent(dispatch);
        } catch (error) {
            console.error(error.message);
        }
    }
}