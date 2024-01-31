import { LightningElement, track, api } from 'lwc';

export default class CreateField extends LightningElement {
    @api boardid;
    @track fieldName = '';
    @track fieldOrder;

    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;

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
            console.log(this.fieldOrder + 'fieldorder');
            if (this.fieldName != undefined && this.fieldName.trim() != '' && (this.fieldOrder > 0 || this.fieldOrder == undefined || this.fieldOrder.trim() == '')) {
                if (this.fieldName.length > 25) {
                    this.enqueueToast.push({ status: 'error', message: 'NAME IS TOO BIG' });
                    this.toastprocess(null);
                } else {
                    const dispatch = new CustomEvent("savefield", {
                        detail: fieldrecord
                    })
                    this.dispatchEvent(dispatch);
                }
            } else {
                this.enqueueToast.push({ status: 'error', message: 'PLEASE FILL CORRECT/REQUIRED FIELD' });
                this.toastprocess(null);
            }

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
            console.log(this.fieldOrder + 'fieldorder');
            if (this.fieldName != undefined && this.fieldName.trim() != '' && (this.fieldOrder > 0 || this.fieldOrder == undefined || this.fieldOrder.trim() == '')) {
                if (this.fieldName.length > 25) {
                    this.enqueueToast.push({ status: 'error', message: 'NAME IS TOO BIG' });
                    this.toastprocess(null);
                } else {
                    const dispatch = new CustomEvent("saveandnewfield", {
                        detail: fieldrecord
                    })
                    this.dispatchEvent(dispatch);
                    this.fieldName = undefined;
                    this.fieldOrder = undefined;
                }
            } else {
                this.enqueueToast.push({ status: 'error', message: 'PLEASE FILL CORRECT/REQUIRED FIELD' });
                this.toastprocess(null);
            }

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

    @api createfieldtoast(event) {
        if (event == 'success') {
            this.enqueueToast.push({ status: 'success', message: 'FIELD CREATED SUCCESSFULLY' });
            this.toastprocess(null);
        } else {
            this.enqueueToast.push({ status: 'failed', message: 'FIELD CREATE FAILED' });
            this.toastprocess(null);
        }
    }
}