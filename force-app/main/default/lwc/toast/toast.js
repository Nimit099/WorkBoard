import { LightningElement, track, api } from 'lwc';
export default class Toast extends LightningElement {

    @track error = false;
    @track success = false;
    @api type;
    @api toastmessage;

    // Created By Nimit Shah on 12/08/2023  ---  This is use to show toast message
    // Updated By Nimit Shah on 23/8/2023   ---  This is update to reduce time limit of the toast
    // STATUS - DONE
    @api
    showToast(type, message) {
        try {

            this.toastmessage = message;

            if (type == "success") {
                this.success = true;
                this.error = false;
            }
            else {
                this.success = false;
                this.error = true;
            }

            setTimeout(() => {

                this.success = false;
                this.error = false;
                this.type = '';
                this.toastmessage = '';

                const dispatch = new CustomEvent("completeonetoast", {
                    detail: 'onetoastdone'
                })
                this.dispatchEvent(dispatch);

            }, 2700);

        } catch (error) {
            console.error('OUTPUT showtoast : ', error);
        }
    }

}