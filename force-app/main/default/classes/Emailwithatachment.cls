public with sharing class Emailwithatachment {

    public class FlowInputs {
        @InvocableVariable public String recordId;
        // @InvocableVariable public String ContentDocumentId;
        @InvocableVariable public String ToAddress;
        @InvocableVariable public String BccAddress;
        @InvocableVariable public String CcAddress;
        @InvocableVariable public String Subject;
        @InvocableVariable public String Message;
    }
    @InvocableMethod
    public static void sendemailwithattachment(List<FlowInputs> flowinput) {

        List<String> Toaddresses = new List<String>();
        List<String> Bccaddresses = new List<String>();
        List<String> Ccaddresses = new List<String>();
        List<Id> cdlId = new List<Id>();
        List<Blob> fileData = new List<Blob> ();
        Messaging.SingleEmailMessage emailNotification = new Messaging.SingleEmailMessage();
        Messaging.EmailFileAttachment emailAttachment = new Messaging.EmailFileAttachment();

        Toaddresses.add(flowinput[0].ToAddress);
        if(flowinput[0].BccAddress.length() > 0){
            Bccaddresses.add(flowinput[0].BccAddress);
        }
        if(flowinput[0].CcAddress.length() > 0){
            Ccaddresses.add(flowinput[0].CcAddress);
        }
       
        List<ContentDocumentLink> cdllist = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =: flowinput[0].recordId];
        for(ContentDocumentLink cdl : cdllist){
            cdlId.add(cdl.ContentDocumentId);
        }
        List<ContentVersion> cvlist  = [ SELECT Title, VersionData, FileExtension FROM ContentVersion WHERE ContentDocumentId IN: cdlId ];
        
        emailNotification.setToAddresses(Toaddresses);
        if(Ccaddresses.size() > 0){
        emailNotification.setCCaddresses(Ccaddresses);
        }
        if(Bccaddresses.size() > 0){
        emailNotification.setBCCaddresses(Bccaddresses);
        }
        if(flowinput[0].Subject.length() > 0){
            emailNotification.setSubject(flowinput[0].Subject);
        }
        if(flowinput[0].Message.length() > 0){
            emailNotification.setHtmlBody(flowinput[0].Message);
        }
        for (ContentVersion cv : cvlist) {
            emailAttachment.setFileName(cv.Title);
            emailAttachment.setBody(cv.VersionData);
        }
        
        emailNotification.setFileAttachments(new Messaging.EmailFileAttachment[]{ emailAttachment });
        Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[]{ emailNotification });
        System.debug(results);
        
    }
}