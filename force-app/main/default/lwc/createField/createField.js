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

            if (this.fieldName != undefined && this.fieldName.trim() != '') {
                const dispatch = new CustomEvent("savefield", {
                    detail: fieldrecord
                })
                this.dispatchEvent(dispatch);
            } else {
                this.enqueueToast.push({ status: 'error', message: 'PLEASE FILL REQUIRED FIELD' });
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

            if (this.fieldName != undefined && this.fieldName.trim() != '') {
                const dispatch = new CustomEvent("saveandnewfield", {
                    detail: fieldrecord
                })
                this.dispatchEvent(dispatch);

                this.enqueueToast.push({ status: 'success', message: 'FIELD CREATED SUCCESSFULLY' });
                this.toastprocess(null);
            } else {
                this.enqueueToast.push({ status: 'error', message: 'PLEASE FILL REQUIRED FIELD' });
                this.toastprocess(null);
            }

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