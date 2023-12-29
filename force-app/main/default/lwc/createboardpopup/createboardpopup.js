import { LightningElement, track } from 'lwc';

export default class Createboardpopup extends LightningElement {

    @track name = '';
    @track description;

    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;

    // CREATION - Created By Nimit Shah on 12/08/2023 --- This function is use to take input of Board Details.
    // UPDATION - Updated By Nimit Shah on 22/08/2023 --- Make it lighter and furnish the code
    // CONDITION - Cleaned code
    // STATUS - DONE
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
            boardrecord['Description__c'] = this.description;

            if (this.name == null || this.name == undefined || this.name.trim() == '') {
                this.enqueueToast.push({ status: 'error', message: 'PLEASE FILL REQUIRED FIELD' });
                this.toastprocess(null);
            } else if (this.name.length > 25) {
                this.enqueueToast.push({ status: 'error', message: 'NAME IS TOO BIG' });
                this.toastprocess(null);
            } else {
                const dispatch = new CustomEvent("saveboard", {
                    detail: boardrecord
                })
                this.dispatchEvent(dispatch);
            }
        } catch (error) {
            console.error(error);
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
            this.spinnertable = false;
            console.error(error.message);
        }
    }
}