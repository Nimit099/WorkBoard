import { LightningElement, track, api } from 'lwc';
export default class Toast extends LightningElement {

    @track error = false;
    @track success = false;
    @api type 
    // @track showtoast = false;
    @api toastmessage;
    @api
    showToast(type, message) {
        try {
            this.showtoast = true;
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
                this.showtoast = false
                this.success = false;
                this.error = false;
                this.type = '';
                this.toastmessage = '';
            }, 4000);
        } catch (error) {
            console.log('OUTPUT showtoast : ', error);
        }
    }

}