public with sharing class viewBoard {

    @AuraEnabled
    public static FieldTicketwrapper getBoardData(Id boardId){
        try {
            List<Fields__c> fieldList = [SELECT Id, Name, OrderNumber__c, Board__c FROM Fields__c  WHERE Board__c =: boardId AND DeletedDate__c =: null WITH SECURITY_ENFORCED ORDER BY OrderNumber__c ASC];
            List<Ticket__c> ticketList = [SELECT Id, Name, TicketNumber__c,  TicketPriority__c, DeletedDate__c, Field__c, Color__c,CreatedDate FROM Ticket__c WHERE Field__c IN: fieldList WITH SECURITY_ENFORCED];

            FieldTicketwrapper ftw = new FieldTicketwrapper();
            ftw.fieldList = fieldList;
            ftw.ticketList = ticketList;

            if (Test.isRunningTest() && boardId == 'xxx') {
                Integer i = 5/0;
            }
            return ftw;
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);
            return null;
        }
    }

    //It is call when someone create ticket
    @AuraEnabled
    public static Ticket__c createticket(Ticket__c newticket){
        try{
            Ticket__c ticket = new Ticket__c (TicketNumber__c = newticket.TicketNumber__c, Name = newticket.Name, Description__c = newticket.Description__c, StartDate__c  = newticket.StartDate__c, EndDate__c =  newticket.EndDate__c, TicketPriority__c  = newticket.TicketPriority__c, Field__c = newticket.Field__c, Color__c = newticket.Color__c, CompletedPercentage__c = newticket.CompletedPercentage__c);
            insert ticket;
            return ticket;
        } catch(Exception e){
            System.debug(e);
            HandleExceptions eh = new HandleExceptions(e);
            return null; 
        }
    }

    //It is call when someone update ticket
    @AuraEnabled
    public static void updateticket(Ticket__c newticket){
        try{
            Ticket__c ticket = new Ticket__c (Id = newticket.Id, TicketNumber__c = newticket.TicketNumber__c, Name = newticket.Name, Description__c = newticket.Description__c, StartDate__c  = newticket.StartDate__c, EndDate__c =  newticket.EndDate__c, TicketPriority__c  = newticket.TicketPriority__c, Field__c = newticket.Field__c, Color__c = newticket.Color__c, CompletedPercentage__c = newticket.CompletedPercentage__c);
            update ticket;
        } catch(Exception e){
            System.debug(e);
            HandleExceptions eh = new HandleExceptions(e); 
        }
    }
    

    // It is call when someone drag and drop ticket
    @AuraEnabled
    public static void updateticketfield(Id ticketId, Id fieldId){
        try{
        Database.upsert(new Ticket__c (Id = ticketId, Field__c = fieldId));
        } catch (Exception e){
            System.debug(e);
            HandleExceptions eh = new HandleExceptions(e);
        }
    }

    @AuraEnabled
    public static void temporarydeleteticket(Id ticketId){
        try {
            Database.upsert(new Ticket__c(Id = ticketId, DeletedDate__c = System.today()));
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);
        }
    }

    @AuraEnabled
    public static void restoreticket(Id ticketId){
        try {
            Database.upsert(new Ticket__c(Id = ticketId, DeletedDate__c = null));
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e); 
        }
    }

    @AuraEnabled
    public static void permanentdeleteticket(Id ticketId){
        try {
            Set<Id> cdId = new Set<Id>();
            List<ContentDocumentLink> cdllist = [SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =: ticketId];
            for (ContentDocumentLink cdl : cdllist) {
                cdId.add(cdl.ContentDocumentId);
            }
            List<ContentDocument> cd = [SELECT Id FROM ContentDocument WHERE Id IN: cdId];
            Database.delete(cd);
            Database.delete(ticketId);
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);   
        }
    }

    @AuraEnabled
    public static Ticket__c getTicket(Id ticketId){
        try {
            Ticket__c ticketList = [SELECT Id, Name, TicketNumber__c,  TicketPriority__c, Field__r.Name, StartDate__c,EndDate__c,Description__c, CompletedPercentage__c, Field__c, Color__c,CreatedDate, LastModifiedDate FROM Ticket__c WHERE Id =: ticketId WITH SECURITY_ENFORCED];
            return ticketList;
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);  
            return null; 
        }
    }

    public class FieldTicketwrapper{
        @AuraEnabled
        public List<Fields__c> fieldList {get; set;}
        @AuraEnabled
        public List<Ticket__c> ticketList {get; set;}
    }

    @AuraEnabled
    public static List<ContentVersion> uploadFile(String base64, String filename, String ticketId) {
        try {
            ContentVersion cv = new ContentVersion();
            cv.VersionData = EncodingUtil.base64Decode(base64);
            cv.Title = filename;
            cv.PathOnClient = filename;
            insert as User cv; 
            
            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id].ContentDocumentId;
            cdl.LinkedEntityId = ticketId;
            cdl.ShareType = 'V';
            insert as User cdl;

            if (Test.isRunningTest() && ticketId == 'xxx') {
                Integer i = 5/0;
            }

            return retrieveFiles(ticketId);
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);  
            return null;
        }
    }

    @AuraEnabled
    public static List<ContentVersion> retrieveFiles(String ticketId){
        try {
            List<ContentDocumentLink> cdlList = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =: ticketId];
            List<Id> cdIds = new List<Id>();
            for(ContentDocumentLink obj: cdlList){
                cdIds.add(obj.ContentDocumentId);
            }
            List<ContentVersion> cvList = [SELECT Id, ContentDocumentId, ContentUrl, VersionNumber, Title, PathOnClient, FileType, FileExtension, ContentSize, CreatedDate FROM ContentVersion WHERE ContentDocumentId IN:cdIds];
            return cvList;        
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);  
            return null;
        }
    }    

    @AuraEnabled
    public static List<ContentVersion> deletefile( String contentDocId, String ticketId){
        try {
            Database.delete(contentDocId);
            return retrieveFiles(ticketId);
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);  
            return null;
        }
    }

    @AuraEnabled
    public static List<Comment__c> getTicektsComment(Id ticketId){
        try {
            return [SELECT Id, Comments__c, CreatedDate, CreatedBy.Name FROM Comment__c WHERE Ticket__c =: ticketId ORDER BY CreatedDate DESC ];
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);  
            return null;
        }
    }

    @AuraEnabled
    public static List<Comment__c> saveComment(Id commentId, Id ticketId, String comment){
        try {
            upsert as User ( new Comment__c (Id = commentId, Ticket__c = ticketId, Comments__c = comment));
            return [SELECT Id, Comments__c, CreatedDate, CreatedBy.Name FROM Comment__c WHERE Ticket__c =: ticketId ORDER BY CreatedDate DESC ];
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);  
            return null;
        }
    }

    @AuraEnabled
    public static List<Comment__c> deleteComment(Id commentId, Id ticketId){
        try {
            Database.delete(commentId);
            System.debug([SELECT Id, Comments__c, CreatedDate, CreatedBy.Name FROM Comment__c WHERE Ticket__c =: ticketId ORDER BY CreatedDate DESC ]);
            return [SELECT Id, Comments__c, CreatedDate, CreatedBy.Name FROM Comment__c WHERE Ticket__c =: ticketId ORDER BY CreatedDate DESC ];
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);  
            return null;
        }
    }
}