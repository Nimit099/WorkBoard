import { LightningElement, track } from 'lwc';

export default class Createboardpopup extends LightningElement {

    @track name = '';
    @track description = '';

    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;

    handleinput(event) {
        try {

            if (event.currentTarget.dataset.name == 'name') {
                this.name = event.target.value;
            } else if (event.currentTarget.dataset.name == 'description') {
                this.description = event.target.value;
            }

        } catch (error) {
            this.spinnertable = false;
            console.error('OUTPUT popupinput : ', error.message);
        }
    }

    createboardclose() {
        try {
            const dispatch = new CustomEvent("closeboard", {
                detail: null
            })
            this.dispatchEvent(dispatch);
        } catch (error) {
            console.error(error);
        }
    }

    createboard() {
        try {
            let boardrecord = {
                'sobjectType': 'Board__c'
            };
            boardrecord['Name'] = this.name;
            boardrecord['GB_24__Description__c'] = this.description;

            if (this.name == null || this.name == undefined || this.name.trim() == '') {
                this.enqueueToast.push({ status: 'error', message: 'PLEASE FILL REQUIRED FIELD' });
                this.toastprocess(null);
            } else if (this.name.length > 25 || this.description.length > 100000) {
                this.enqueueToast.push({ status: 'error', message: 'CHARACTER LENGTH EXCEED' });
                this.toastprocess(null);
            } else {
                const dispatch = new CustomEvent("saveboard", {
                    detail: boardrecord
                })
                this.dispatchEvent(dispatch);
            }
        } catch (error) {
            console.error(error);
            this.enqueueToast.push({ status: 'error', message: 'FAILED TO SAVE BOARD' });
            this.toastprocess(null);
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
            this.spinnertable = false;
            console.error(error.message);
        }
    }
}