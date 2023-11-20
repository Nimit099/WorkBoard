import { LightningElement, api, track } from 'lwc';
import getTicket from '@salesforce/apex/viewBoard.getTicket';
import updatetickets from '@salesforce/apex/viewBoard.updateticket';
import uploadFile from '@salesforce/apex/viewBoard.uploadFile';
import retrieveFiles from '@salesforce/apex/viewBoard.retrieveFiles';
import deletefile from '@salesforce/apex/viewBoard.deletefile';
import getTicektsComment from '@salesforce/apex/viewBoard.getTicektsComment';
import saveComment from '@salesforce/apex/viewBoard.saveComment';
import deleteComment from '@salesforce/apex/viewBoard.deleteComment';


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
    @track deletemodal = false;
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

    connectedCallback() {
        try {
            getTicket({ ticketId: this.ticketid })
                .then(result => {
                    this.ticketpopupdata = result;
                    this.assignvalue();
                }).catch(error => {
                    console.error(error.message);
                })
            this.getfiles();
            this.getTicketComments();
        } catch (error) {
            console.error(error.message);
        }

    }

    editticketpopup() {
        try {
            this.isupdateticket = !this.isupdateticket;
        } catch (error) {
            console.error('editticketpopup', error.message);
        }
    }

    updateticket(event) {
        try {
            let ticket = JSON.parse(JSON.stringify(event.detail));
            ticket.Id = this.ticketid;
            updatetickets({ newticket: ticket })
                .then(() => {
                    this.ticketpopupdata = ticket;
                    this.assignvalue();
                    this.editticketpopup();
                }).catch(error => {
                    console.error('updateticketmethodcall', error);
                });
        } catch (error) {
            console.error('updateticket', error.message);
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
        }
    }

    assignvalue() {
        try {

            this.ticketName = this.ticketpopupdata.Name;
            this.ticketNumber = this.ticketpopupdata.TicketNumber__c;

            if (this.ticketpopupdata.Field__r != undefined) {
                this.ticketFieldName = this.ticketpopupdata.Field__r.Name;
                this.ticketFieldId = this.ticketpopupdata.Field__r.Id;
            }

            if (this.ticketpopupdata.Color__c != undefined)
                this.ticketColor = this.ticketpopupdata.Color__c;

            if (this.ticketpopupdata.CreatedDate != undefined)
                this.ticketCreatedDate = this.ticketpopupdata.CreatedDate;

            if (this.ticketpopupdata.LastModifiedDate != undefined)
                this.ticketLastmodifieddate = this.ticketpopupdata.LastModifiedDate;

            if (this.ticketpopupdata.Description__c != undefined)
                this.ticketDescription = this.ticketpopupdata.Description__c;

            if (this.ticketpopupdata.TicketPriority__c != undefined)
                this.ticketPriority = this.ticketpopupdata.TicketPriority__c;

            if (this.ticketpopupdata.StartDate__c != undefined)
                this.ticketStartDate = this.ticketpopupdata.StartDate__c;

            if (this.ticketpopupdata.EndDate__c != undefined)
                this.ticketEndDate = this.ticketpopupdata.EndDate__c;

            if (this.ticketpopupdata.CompletedPercentage__c != undefined)
                this.ticketCompletedPercentage = this.ticketpopupdata.CompletedPercentage__c;

        } catch (error) {
            console.error(error.message);
        }
    }

    openfileUpload(event) {
        try {
            const file = event.target.files[0];
            var reader = new FileReader()
            reader.onload = () => {
                var base64 = reader.result.split(',')[1];

                uploadFile({ base64: base64, filename: file.name, ticketId: this.ticketid }).then(result => {
                    this.prepareFileRows(result);
                }).catch(error => {
                    console.error(error.message);
                });
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error(error.message);
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
            console.error(error.message);
            console.error(error);
        }
    }

    prepareFileRows(data) {
        try {
            if (data.length > 0) {
                this.filescount = true;
                this.files = []; //initialize the array
                //extract file data and prepare files array with converted information
                data.map(element => {
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
            console.error(error.message);
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

    openclosedeletepopup(event) {
        try {
            this.deletemodal = !this.deletemodal;
            this.activetab = 'attachment';
            if (event != null) {
                this.fileId = event.currentTarget.dataset.id;
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    deletefiles() {
        try {
            deletefile({ contentDocId: this.fileId, ticketId: this.ticketid }).then(result => {
                this.prepareFileRows(result);
                this.openclosedeletepopup(null);
            }).catch(error => {
                console.error(error.message);
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    getTicketComments() {
        try {
            getTicektsComment({ ticketId: this.ticketid }).then(result => {
                this.comments = result;
            }).catch(error => {
                console.error(error);
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    commentinput(event) {
        this.newcomment = event.target.value;
    }

    editcomment(event) {
        try {
            this.commentId = event.currentTarget.dataset.id;
            this.comments.forEach(element => {
                if (element.Id == this.commentId) {
                    this.newcomment = element.Comments__c;
                }
            });
            this.commentbutton();

        } catch (error) {
            console.error(error.message);
        }
    }

    commentbutton() {
        try {
            if (this.buttonlabel == 'Add Comment') {
                this.buttonlabel = 'Save Comment';
                this.commentediting = true;
            } else {
                this.buttonlabel = 'Add Comment';
                this.commentediting = false;
                saveComment({ commentId: this.commentId, ticketId: this.ticketid, comment: this.newcomment }).then(result => {
                    this.comments = result;
                    this.newcomment = '';
                }).catch(error => {
                    console.error(error);
                });
            }

        } catch (error) {
            console.error(error.message);
            console.error(error);

        }
    }

    cancelcomment() {
        try {
            this.buttonlabel = 'Add Comment';
            this.commentediting = false;
            this.newcomment = '';
        } catch (error) {
            console.error(error);
            console.error(error.message);
        }
    }

    commentdeletebutton(event) {
        try {
            this.commentdeleting = true;
            this.commentId = event.currentTarget.dataset.id;
        } catch (error) {
            console.error(error);
            console.error(error.message);

        }
    }

    commentdelete(event) {
        try {
            this.commentdeleting = false;
            if (event.currentTarget.dataset.name == 'delete') {
                deleteComment({ commentId: this.commentId, ticketId: this.ticketid }).then(result => {
                    this.comments = result;
                }).catch(error => {
                    console.error(error);
                });
            }
        } catch (error) {
            console.error(error);
            console.error(error.message);
        }
    }
}