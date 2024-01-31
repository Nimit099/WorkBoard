import { LightningElement, api, track } from 'lwc';
import getFields from '@salesforce/apex/FieldController.getFields';
import createfield from '@salesforce/apex/FieldController.createfield';
import temporarydeletefield from '@salesforce/apex/FieldController.temporarydeletefield';
import restoreFields from '@salesforce/apex/FieldController.restoreFields';
import fieldPositionchange from '@salesforce/apex/FieldController.fieldPositionchange';
import renamefield from '@salesforce/apex/FieldController.renamefield';

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
    @track dragfieldId;
    @track newname;
    @track noteditname = true;
    outsideClick;
    @track editfieldId;
    @track spinnertable = false;
    @track firstPart;
    @track secondPart;

    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;

    connectedCallback() {
        try {
            this.spinnertable = true;
            // This is use to get todays date 
            this.today = new Date();
            var dd = String(this.today.getDate()).padStart(2, '0');
            var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = this.today.getFullYear();
            this.today = yyyy + '-' + mm + '-' + dd;

            if (this.boardname.includes(' ')) {
                var words = this.boardname.split(' ');
                this.firstPart = words[0];
                this.secondPart = words.slice(1).join(' ')
            } else {
                let midpoint = Math.ceil(this.boardname.length / 2);
                this.firstPart = this.boardname.slice(0, midpoint);
                this.secondPart = this.boardname.slice(midpoint);
            }

            getFields({ boardId: this.boardid })
                .then(result => {
                    this.spinnertable = false;
                    this.allfields = result;
                    this.fieldformatter();

                }).catch(error => {
                    this.enqueueToast.push({ status: 'failed', message: 'FAILED TO GET FIELD' });
                    this.toastprocess(null);
                    this.spinnertable = false;
                    console.error(error.message);
                });
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    openclosecreatefield() {
        this.createField = !this.createField;
    }

    savefield(event) {
        try {
            this.openclosecreatefield();
            this.saveandnewfield(event);
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    saveandnewfield(event) {
        try {
            this.spinnertable = true;
            let field = JSON.parse(JSON.stringify(event.detail));

            createfield({ field: field, boardid: this.boardid })
                .then(result => {
                    this.spinnertable = false;
                    let firstfieldid = result[0].Id;
                    firstfieldid = this.fieldid;
                    if (!this.createField) {
                        this.enqueueToast.push({ status: 'success', message: 'FIELD CREATED SUCCESSFULLY' });
                        this.toastprocess(null);
                    } else {
                        this.template.querySelector('c-create-field').createfieldtoast('success');
                    }
                    this.allfields = result;
                    this.fieldformatter();
                }).catch(error => {
                    this.spinnertable = false;
                    if (this.createField) {
                        this.template.querySelector('c-create-field').createfieldtoast('failed');
                    } else {
                        this.enqueueToast.push({ status: 'failed', message: 'FIELD CREATION FAILED' });
                        this.toastprocess(null);
                    }
                    console.error(error.message);
                });
        } catch (error) {
            this.spinnertable = false;
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
            this.spinnertable = false;
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
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    handletemporarydeletefield() {
        try {
            this.spinnertable = true;
            this.openclosedeletepopup(null);
            temporarydeletefield({ fieldid: this.fieldid, boardid: this.boardid })
                .then(result => {
                    this.allfields = result;
                    this.fieldformatter();
                    this.spinnertable = false;
                    this.enqueueToast.push({ status: 'success', message: 'FIELD DELETED SUCCESSFULLY' });
                    this.toastprocess(null);

                }).catch(error => {
                    this.enqueueToast.push({ status: 'failed', message: 'FIELD DELETE FAILED' });
                    this.toastprocess(null);
                    console.error(error.message);
                });
        } catch (error) {
            this.enqueueToast.push({ status: 'failed', message: 'FIELD DELETE FAILED' });
            this.toastprocess(null);
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    opencloserecyclepopup() {
        this.isRecyclemodal = !this.isRecyclemodal;
    }

    permanentdeletefield(event) {
        try {
            let i = 0;
            this.allfields.forEach((element, index) => {
                if (element.Id == event.detail) {
                    i = index;
                }
            });
            this.allfields.splice(i, 1);
            this.fieldformatter();
        } catch (error) {
            this.spinnertable = false;
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

    fieldformatter() {

        this.fielddata = [];
        this.deletedfield = [];
        this.allfields.forEach(element => {
            if (element.DeletedDate__c == undefined) {
                this.fielddata.push(element);
            } else {
                this.deletedfield.push(element);
            }
        });
        if (this.fielddata.length > 0) {
            this.fieldsfound = true;
        } else {
            this.fieldsfound = false;
        }
    }

    restorefield(event) {
        try {
            let fieldId = event.detail;
            restoreFields({ fieldId: fieldId, boardId: this.boardid })
                .then(result => {
                    this.allfields = result;
                    this.fieldformatter();
                }).catch(error => {
                    this.enqueueToast.push({ status: 'failed', message: 'FIELD RESTORE FAILED' });
                    this.toastprocess(null);
                    console.error(error.message);
                    this.spinnertable = false;
                });

        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    dragstart(event) {
        this.dragfieldId = event.currentTarget.dataset.id;
    }

    dragover(event) {
        event.preventDefault();
    }

    dropzone(event) {
        try {
            let droppedfieldId = event.currentTarget.dataset.id;
            fieldPositionchange({ dragfieldId: this.dragfieldId, dropfieldId: droppedfieldId, boardId: this.boardid })
                .then(result => {
                    this.allfields = result;
                    this.fieldformatter();
                    this.enqueueToast.push({ status: 'success', message: 'FIELD POSITION CHANGED' });
                    this.toastprocess(null);
                }).catch(error => {
                    this.enqueueToast.push({ status: 'failed', message: 'FIELD UPDATE FAILED' });
                    this.toastprocess(null);
                    this.spinnertable = false;
                    console.error(error);
                });
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    namechange(event) {
        try {
            if (event.keyCode == 27) {
                this.cancelRenameField();
            } else if (event.keyCode == 13) {
                if (this.newname.length > 25) {
                    this.enqueueToast.push({ status: 'error', message: 'NAME IS TOO BIG' });
                    this.toastprocess(null);
                } else {
                    renamefield({ fieldId: this.editfieldId, newName: this.newname })
                        .then(() => {
                            this.allfields.forEach(element => {
                                if (element.Id == this.editfieldId) {
                                    element.Name = this.newname;
                                }
                            });
                            this.fieldformatter();
                            this.cancelRenameField();
                            this.enqueueToast.push({ status: 'success', message: 'FIELD UPDATED SUCCESSFULLY' });
                            this.toastprocess(null);
                        }).catch(error => {
                            this.enqueueToast.push({ status: 'failed', message: 'FIELD UPDATE FAILED' });
                            this.toastprocess(null);
                            console.error(error);
                            this.spinnertable = false;
                        });
                }
            } else {
                this.newname = event.target.value;
            }
        } catch (error) {
            console.error(error);
            this.spinnertable = false;
        }
    }

    cancelRenameField() {
        try {
            if (this.editfieldId != null) {
                this.newname = '';
                this.noteditname = true;
                let deletenote = this.template.querySelectorAll("div[data-delete =" + this.editfieldId + "]");
                deletenote.forEach(element => {
                    element.style.display = 'flex';
                });
                this.template.querySelector("span[data-rename =" + this.editfieldId + "]").style.display = 'none';
                this.template.querySelector("span[data-name =" + this.editfieldId + "]").style.display = 'flex';
                this.template.querySelector("div[data-name =" + this.editfieldId + "]").style.display = 'none';
                document.removeEventListener('click', this.outsideClick);
                this.editfieldId = null;
            }
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    editnamefunc(event) {
        try {
            this.cancelRenameField();
            this.editfieldId = event.currentTarget.dataset.name;
            let deletenote = this.template.querySelectorAll("div[data-delete =" + this.editfieldId + "]");
            deletenote.forEach(element => {
                element.style.display = 'none';
            });
            this.template.querySelector("span[data-rename =" + this.editfieldId + "]").style.display = 'block';
            this.template.querySelector("span[data-name =" + this.editfieldId + "]").style.display = 'none';
            this.template.querySelector("div[data-name =" + this.editfieldId + "]").style.display = 'flex';
            document.addEventListener('click', this.outsideClick = this.cancelRenameField.bind(this));
            event.stopPropagation();
            return false;
        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    insideClick(event) {
        event.stopPropagation();
        return false;
    }
}