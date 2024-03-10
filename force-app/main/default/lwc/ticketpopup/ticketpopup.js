import { LightningElement, api, track } from 'lwc';
import getTicket from '@salesforce/apex/ViewBoard.getTicket';
import updatetickets from '@salesforce/apex/ViewBoard.updateticket';
import uploadFile from '@salesforce/apex/ViewBoard.uploadFile';
import retrieveFiles from '@salesforce/apex/ViewBoard.retrieveFiles';
import deletefile from '@salesforce/apex/ViewBoard.deletefile';
import getTicektsComment from '@salesforce/apex/ViewBoard.getTicektsComment';
import saveComment from '@salesforce/apex/ViewBoard.saveComment';
import deleteComment from '@salesforce/apex/ViewBoard.deleteComment';


export default class Ticketpopup extends LightningElement {

    @track ticketpopupdata;
    @track isupdateticket = false;
    @api ticketid;
    @track ticketName;
    @track ticketNumber;
    @track ticketCreatedDate;
    @track ticketDescription = 'There is no Description.';
    @track ticketPriority;
    @track ticketStartDate;
    @track ticketEndDate;
    @track ticketFieldName;
    @track ticketFieldId;
    @track ticketColor;
    @track ticketCompletedPercentage = 0;
    @track ticketLastmodifieddate = '';
    @api fields = 'There is no Attachments';
    @track fileId;
    @track files;
    @track activetab = 'comment';
    @track filescount = false;
    @track comments = [];
    @track commentediting = false;
    @track newcomment;
    @track buttonlabel = 'Add Comment';
    @track commentId;
    @track commentdeleting = false;
    @track commentscount = false;
    // This variables use in Toast
    @track enqueueToast = [];
    @track ongoingtoast;
    @track spinnertable = false;

    @track attachmentdeleting = false;

    connectedCallback() {
        try {
            this.spinnertable = true;
            this.getTickets();
            this.getfiles();
            this.getTicketComments();
        } catch (error) {
            console.error(error.message);
            this.spinnertable = false;
        }
    }

    getTickets() {
        getTicket({ ticketId: this.ticketid })
            .then(result => {
                this.ticketpopupdata = result;
                this.assignvalue();
                this.spinnertable = false;
            }).catch(error => {
                console.error(error.message);
                this.spinnertable = false;
            });
    }

    editticketpopup() {
        try {
            this.isupdateticket = !this.isupdateticket;
        } catch (error) {
            console.error('editticketpopup', error.message);
            this.spinnertable = false;
        }
    }

    updateticket(event) {
        try {
            this.spinnertable = true;
            this.editticketpopup();
            let ticket = JSON.parse(JSON.stringify(event.detail));
            ticket.Id = this.ticketid;
            updatetickets({ newticket: ticket })
                .then(() => {
                    this.ticketpopupdata = ticket;
                    this.getTickets();
                    this.spinnertable = false;
                    this.enqueueToast.push({ status: 'success', message: 'TICKET UPDATE SUCCESSFULLY' });
                    this.toastprocess(null);
                    const updateticket = new CustomEvent("updateticket", {
                        detail: 'close'
                    });
                    this.dispatchEvent(updateticket);
                }).catch(error => {
                    this.enqueueToast.push({ status: 'failed', message: 'TICKET UPDATE FAILED' });
                    this.toastprocess(null);
                    this.spinnertable = false;
                    console.error('updateticketmethodcall', error);
                });
        } catch (error) {
            this.enqueueToast.push({ status: 'failed', message: 'TICKET UPDATE FAILED' });
            this.toastprocess(null);
            console.error('updateticket', error.message);
            this.spinnertable = false;
        }
    }

    closeticketpopup() {
        try {
            const closeticketpopup = new CustomEvent("closeticketpopup", {
                detail: 'close'
            });
            this.dispatchEvent(closeticketpopup);
        } catch (error) {
            console.error(error.message);
            this.spinnertable = false;
        }
    }

    assignvalue() {
        try {

            this.ticketName = this.ticketpopupdata.Name;
            this.ticketNumber = this.ticketpopupdata.GB_24__TicketNumber__c;

            if (this.ticketpopupdata.GB_24__Field__r != undefined) {
                this.ticketFieldName = this.ticketpopupdata.GB_24__Field__r.Name;
                this.ticketFieldId = this.ticketpopupdata.GB_24__Field__r.Id;
            }

            if (this.ticketpopupdata.GB_24__Color__c != undefined)
                this.ticketColor = this.ticketpopupdata.GB_24__Color__c;

            if (this.ticketpopupdata.CreatedDate != undefined)
                this.ticketCreatedDate = this.ticketpopupdata.CreatedDate;

            if (this.ticketpopupdata.LastModifiedDate != undefined)
                this.ticketLastmodifieddate = this.ticketpopupdata.LastModifiedDate;

            if (this.ticketpopupdata.GB_24__Description__c != undefined)
                this.ticketDescription = this.ticketpopupdata.GB_24__Description__c;

            if (this.ticketpopupdata.GB_24__TicketPriority__c != undefined)
                this.ticketPriority = this.ticketpopupdata.GB_24__TicketPriority__c;

            if (this.ticketpopupdata.GB_24__StartDate__c != undefined)
                this.ticketStartDate = this.ticketpopupdata.GB_24__StartDate__c;

            if (this.ticketpopupdata.GB_24__EndDate__c != undefined)
                this.ticketEndDate = this.ticketpopupdata.GB_24__EndDate__c;

            if (this.ticketpopupdata.GB_24__CompletedPercentage__c != undefined)
                this.ticketCompletedPercentage = this.ticketpopupdata.GB_24__CompletedPercentage__c;

        } catch (error) {
            console.error(error.message);
            this.spinnertable = false;
        }
    }

    openfileUpload(event) {
        try {
            this.spinnertable = true;
            const file = event.target.files[0];
            if (file.size < 3900000) {
                var reader = new FileReader()
                reader.onload = () => {
                    var base64 = reader.result.split(',')[1];

                    uploadFile({ base64: base64, filename: file.name, ticketId: this.ticketid }).then(result => {
                        this.prepareFileRows(result);
                        this.spinnertable = false;
                        this.enqueueToast.push({ status: 'success', message: 'FILE UPLOADED SUCCESSFULLY' });
                        this.toastprocess(null);

                    }).catch(error => {
                        this.enqueueToast.push({ status: 'failed', message: 'FILE UPLOADED FAILED' });
                        this.toastprocess(null);
                        this.spinnertable = false;
                        console.error(error.message);
                    });
                }
                reader.readAsDataURL(file)
            } else {
                this.spinnertable = false;
                this.enqueueToast.push({ status: 'failed', message: 'FILE SIZE EXCEED' });
                this.toastprocess(null);
            }
        } catch (error) {
            this.enqueueToast.push({ status: 'failed', message: 'FILE UPLOADED FAILED' });
            this.toastprocess(null);
            this.spinnertable = false;
            console.error(error);
        }
    }

    getfiles() {
        try {
            retrieveFiles({ ticketId: this.ticketid }).then(result => {
                this.prepareFileRows(result);
            }).catch(error => {
                console.error(error.message);
            });
        } catch (error) {
            this.enqueueToast.push({ status: 'failed', message: 'FAILED TO GET FILES' });
            this.toastprocess(null);
            this.spinnertable = false;
            console.error(error);
        }
    }

    prepareFileRows(data) {
        try {
            if (data.length > 0) {
                this.filescount = true;
                this.files = []; //initialize the array
                //extract file data and prepare files array with converted information
                data.forEach(element => {
                    let fSize = this.formatFileSize(element.ContentSize);
                    let fDate = this.formatDateString((element.CreatedDate).slice(0, 10));
                    this.files =
                        [...this.files,
                        {
                            fileId: element.Id,
                            fileName: element.Title,
                            filePath: element.PathOnClient,
                            fileType: element.FileType,
                            fileExtn: element.FileExtension,
                            fileSize: fSize,
                            fileDate: fDate,
                            fileDocId: element.ContentDocumentId,
                            thumbnailPath: '/sfc/servlet.shepherd/version/renditionDownload?rendition=thumb120by90&versionId='
                                + element.Id + '&operationContext=CHATTER&contentId=' + element.ContentDocumentId,
                            downloadUrl: '/sfc/servlet.shepherd/document/download/' + element.ContentDocumentId,
                            viewUrl: '/lightning/r/ContentDocument/' + element.ContentDocumentId + '/view'
                        }
                        ]
                });
            } else {
                this.filescount = false;
            }
        } catch (error) {
            this.spinnertable = false;
            console.error(error);
        }
    }

    //This method is used to prepare date as May 16, 2021 which usally comes as YYYY-MM-DD format
    formatDateString(dateStr) {
        const dt = new Date(dateStr);
        const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dt);
        const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(dt);
        const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dt);
        return month + ' ' + day + ', ' + year;
    }

    //This method prepare file size to be displayed in MB or KB
    formatFileSize(fileSize) {
        let f = Math.abs(fileSize / 1024);
        return (f > 1024 ? Math.abs(fileSize / (1024 * 1024)).toFixed(2) + ' MB'
            : Math.round(f) + ' KB');
    }

    deletefiles(event) {
        try {
            if (event.currentTarget.dataset.name == 'delete') {
                this.spinnertable = true;
                deletefile({ contentDocId: this.fileId, ticketId: this.ticketid }).then(result => {
                    this.prepareFileRows(result);
                    this.spinnertable = false;
                    this.enqueueToast.push({ status: 'success', message: 'FILE DELETED SUCCESSFULLY' });
                    this.toastprocess(null);
                    this.attachmentdeleting = false;
                }).catch(error => {
                    this.enqueueToast.push({ status: 'failed', message: 'FILE DELETE FAILED' });
                    this.toastprocess(null);
                    this.spinnertable = false;
                    console.error(error.message);
                });
            } else {
                this.attachmentdeleting = false;
            }
        } catch (error) {
            console.error(error.message);
            this.enqueueToast.push({ status: 'failed', message: 'FILE DELETE FAILED' });
            this.toastprocess(null);
            this.spinnertable = false;
        }
    }

    deleteattachment(event) {
        try {

            if (event != null) {
                this.attachmentdeleting = true;
                this.fileId = event.currentTarget.dataset.id;
            }
        } catch (error) {
            this.spinnertable = false;
        }
    }

    getTicketComments() {
        try {
            getTicektsComment({ ticketId: this.ticketid }).then(result => {
                this.comments = result;
                if (this.comments.length > 0) {
                    this.commentscount = true;
                } else {
                    this.commentscount = false;
                }
            }).catch(error => {
                console.error(error);
                this.enqueueToast.push({ status: 'failed', message: 'FAILED TO GET COMMENTS' });
                this.toastprocess(null);
                this.spinnertable = false;
            });
        } catch (error) {
            console.error(error.message);
            this.enqueueToast.push({ status: 'failed', message: 'FAILED TO GET COMMENTS' });
            this.toastprocess(null);
            this.spinnertable = false;
        }
    }

    commentinput(event) {
        this.newcomment = event.target.value;
    }

    editcomment(event) {
        try {
            this.commentbutton();
            this.commentId = event.currentTarget.dataset.id;
            this.comments.forEach(element => {
                if (element.Id == this.commentId) {
                    this.newcomment = element.GB_24__Comments__c;
                }
            });

        } catch (error) {
            this.spinnertable = false;
            console.error(error.message);
        }
    }

    commentbutton() {
        try {
            if (this.buttonlabel == 'Add Comment') {
                this.buttonlabel = 'Save Comment';
                this.commentId = undefined;
                this.commentediting = true;
            } else {
                this.spinnertable = true;
                if (this.newcomment.length < 131072) {
                    this.buttonlabel = 'Add Comment';
                    this.commentediting = false;
                    saveComment({ commentId: this.commentId, ticketId: this.ticketid, comment: this.newcomment }).then(result => {
                        this.comments = result;
                        if (this.comments.length > 0) {
                            this.commentscount = true;
                        } else {
                            this.commentscount = false;
                        }
                        this.newcomment = '';
                        this.spinnertable = false;
                        this.enqueueToast.push({ status: 'success', message: 'COMMENT SAVE SUCCESSFULLY' });
                        this.toastprocess(null);
                    }).catch(error => {
                        this.spinnertable = false;
                        this.enqueueToast.push({ status: 'failed', message: 'COMMENT SAVE FAILED' });
                        this.toastprocess(null);
                        console.error(error);
                    });
                } else {
                    this.enqueueToast.push({ status: 'failed', message: 'CHARACTER LENGTH EXCEED' });
                    this.toastprocess(null);
                    this.spinnertable = false;
                }
            }

        } catch (error) {
            console.error(error.message);
            this.enqueueToast.push({ status: 'failed', message: 'COMMENT SAVE FAILED' });
            this.toastprocess(null);
            this.spinnertable = false;
        }
    }

    cancelcomment() {
        try {
            this.buttonlabel = 'Add Comment';
            this.commentediting = false;
            this.newcomment = '';
        } catch (error) {
            console.error(error);
            this.spinnertable = false;
        }
    }

    commentdeletebutton(event) {
        try {
            this.commentdeleting = true;
            this.commentId = event.currentTarget.dataset.id;
        } catch (error) {
            console.error(error);
            this.spinnertable = false;
        }
    }

    commentdelete(event) {
        try {
            this.commentdeleting = false;
            if (event.currentTarget.dataset.name == 'delete') {
                this.spinnertable = !this.spinnertable;
                deleteComment({ commentId: this.commentId, ticketId: this.ticketid }).then(result => {
                    this.commentId = null;
                    this.comments = result;
                    if (this.comments.length > 0) {
                        this.commentscount = true;
                    } else {
                        this.commentscount = false;
                    }
                    this.spinnertable = false;
                    this.enqueueToast.push({ status: 'success', message: 'COMMENT DELETED SUCCESSFULLY' });
                    this.toastprocess(null);
                }).catch(error => {
                    this.enqueueToast.push({ status: 'failed', message: 'COMMENT DELETE FAILED' });
                    this.toastprocess(null);
                    console.error(error);
                    this.spinnertable = false;

                });
            }
        } catch (error) {
            this.enqueueToast.push({ status: 'failed', message: 'COMMENT DELETE FAILED' });
            this.toastprocess(null);
            console.error(error.message);
            this.spinnertable = false;
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