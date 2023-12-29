import { LightningElement, track, wire } from 'lwc';
import ViewBoard from '@salesforce/resourceUrl/ViewBoard';
import ViewTicket from '@salesforce/resourceUrl/ViewTicket';
import Recyclebin from '@salesforce/resourceUrl/Recyclebin';
import Field from '@salesforce/resourceUrl/Field';
import Comment from '@salesforce/resourceUrl/Comment';
import Chart_2 from '@salesforce/resourceUrl/Chart_2';
import Chart_1 from '@salesforce/resourceUrl/Chart_1';
import Home from '@salesforce/resourceUrl/Home';
import Attachment from '@salesforce/resourceUrl/Attachment';
import CreateTicket from '@salesforce/resourceUrl/CreateTicket';
import CreateBoard from '@salesforce/resourceUrl/CreateBoard';
import CreateField from '@salesforce/resourceUrl/CreateField';
import userconfig from '@salesforce/apex/HomePage.userconfig';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserNameFIELD from '@salesforce/schema/User.Name';

export default class UserConfig extends LightningElement {

    @track images;
    @track content;
    @track meta;
    @track metacount;
    @track current = 0;
    @track leftarrow = false;
    @track rightarrow = true;
    @track currentUserName;

    ViewBoard = ViewBoard;
    ViewTicket = ViewTicket;
    Home = Home;
    Field = Field;
    Recyclebin = Recyclebin;
    Chart_1 = Chart_1;
    Chart_2 = Chart_2;
    Attachment = Attachment;
    Comment = Comment;
    CreateTicket = CreateTicket;
    CreateBoard = CreateBoard;
    CreateField = CreateField;

    @wire(getRecord, { recordId: Id, fields: [UserNameFIELD] })
    currentUserInfo({ error, data }) {
        if (data) {
            this.currentUserName = data.fields.Name.value;
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        try {
            userconfig()
                .then(result => {
                    this.meta = result;
                    this.metacount = this.meta.length;
                    this.img(this.meta[this.current]);
                }).catch(error => {
                    console.error(error);
                });
        } catch (error) {
            console.error(error);
            console.error(error.message);
        }
    }

    next() {
        try {
            this.current += 1;
            this.img(this.meta[this.current]);
            if (this.current < this.metacount - 1) {
                this.leftarrow = true;
            } else {
                this.rightarrow = false;
                this.current = this.metacount - 1;
            }
        } catch (error) {
            console.error(error.message);
            console.error(error);
        }
    }

    prev() {
        try {
            this.current -= 1;
            this.img(this.meta[this.current]);
            if (this.current > 0) {
                this.rightarrow = true;
            } else {
                this.leftarrow = false;
                this.current = 0;
            }
        } catch (error) {
            console.error(error.message);
            console.error(error);
        }
    }

    img(file) {
        try {
            this.content = file.UserDescription__c;
            if (file.ImageName__c == 'Home') {
                this.images = Home;
            } else if (file.ImageName__c == 'CreateBoard') {
                this.images = CreateBoard;
            } else if (file.ImageName__c == 'Field') {
                this.images = Field;
            } else if (file.ImageName__c == 'CreateField') {
                this.images = CreateField;
            } else if (file.ImageName__c == 'ViewBoard') {
                this.images = ViewBoard;
            } else if (file.ImageName__c == 'CreateTicket') {
                this.images = CreateTicket;
            } else if (file.ImageName__c == 'ViewTicket') {
                this.images = ViewTicket;
            } else if (file.ImageName__c == 'Comment') {
                this.images = Comment;
            } else if (file.ImageName__c == 'Attachment') {
                this.images = Attachment;
            } else if (file.ImageName__c == 'RecycleBin') {
                this.images = Recyclebin;
            } else if (file.ImageName__c == 'Chart_1') {
                this.images = Chart_1;
            } else if (file.ImageName__c == 'Chart_2') {
                this.images = Chart_2;
            }
        } catch (error) {
            console.error(error);
        }
    }
}