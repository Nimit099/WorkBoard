/*******************************************************
* Name          : ViewBoard
* Author        : Nimit Shah
* Create Date   : 01/01/2024
* UsedBy        : recyclepopup.js, ticketpopup.js, viewBoard.js
* Description   : Use to perform CRUD operation on and related to Ticket__C Object
* Test Class    : ViewBoardTest
*******************************************************/

/**
 * @description ViewBoard Class
 */
public with sharing class ViewBoard {

    /**
     * @description getBoardData Method
     * @param boardId Id of Board__C Object
     * @return Wrapper of Field and Ticket object
     */
    @AuraEnabled
    public static FieldTicketwrapper getBoardData(Id boardId){
        try {
            List<Fields__c> fieldList = [SELECT Id, Name, OrderNumber__c, Board__c FROM Fields__c  WHERE Board__c =: boardId AND DeletedDate__c =: null WITH SECURITY_ENFORCED ORDER BY OrderNumber__c ASC];
            List<Ticket__c> ticketList = [SELECT Id, Name, TicketNumber__c,  TicketPriority__c, DeletedDate__c, Field__c, Color__c,CreatedDate FROM Ticket__c WHERE Field__c IN: fieldList WITH SECURITY_ENFORCED];

            FieldTicketwrapper ftw = new FieldTicketwrapper();
            ftw.fieldList = fieldList;
            ftw.ticketList = ticketList;

            return ftw;
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);
            return null;
        }
    }

    /**
     * @description createticket Method
     * @param newticket Id of Board__C Object
     * @return Record of Ticket__C Object
     */
    @AuraEnabled
    public static Ticket__c createticket(Ticket__c newticket){
        try{
            Ticket__c ticket = new Ticket__c (TicketNumber__c = newticket.TicketNumber__c, Name = newticket.Name, Description__c = newticket.Description__c, StartDate__c  = newticket.StartDate__c, EndDate__c =  newticket.EndDate__c, TicketPriority__c  = newticket.TicketPriority__c, Field__c = newticket.Field__c, Color__c = newticket.Color__c, CompletedPercentage__c = newticket.CompletedPercentage__c);
            insert as User ticket;
            return ticket;
        } catch(Exception e){
            HandleExceptions.handleExceptionsmethod(e);
            return null; 
        }
    }

    /**
     * @description updateticket Method
     * @param newticket Id of Board__C Object
     */
    @AuraEnabled
    public static void updateticket(Ticket__c newticket){
        try{
            Ticket__c ticket = new Ticket__c (Id = newticket.Id, TicketNumber__c = newticket.TicketNumber__c, Name = newticket.Name, Description__c = newticket.Description__c, StartDate__c  = newticket.StartDate__c, EndDate__c =  newticket.EndDate__c, TicketPriority__c  = newticket.TicketPriority__c, Field__c = newticket.Field__c, Color__c = newticket.Color__c, CompletedPercentage__c = newticket.CompletedPercentage__c);
            update as User ticket;
        } catch(Exception e){
            HandleExceptions.handleExceptionsmethod(e); 
        }
    }
    
    /**
     * @description updateticketfield Method
     * @param ticketId Id of Ticket__C Object
     * @param fieldId Id of Field__C Object
     */   
     @AuraEnabled
    public static void updateticketfield(Id ticketId, Id fieldId){
        try{
            upsert as User (new Ticket__c (Id = ticketId, Field__c = fieldId));
        } catch (Exception e){
            HandleExceptions.handleExceptionsmethod(e);
        }
    }

    /**
     * @description temporarydeleteticket Method
     * @param ticketId Id of Ticket__C Object
     */  
    @AuraEnabled
    public static void temporarydeleteticket(Id ticketId){
        try {
            upsert as User (new Ticket__c(Id = ticketId, DeletedDate__c = System.today()));
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);
        }
    }

    /**
     * @description restoreticket Method
     * @param ticketId Id of Ticket__C Object
     */  
    @AuraEnabled
    public static void restoreticket(Id ticketId){
        try {
            upsert as User (new Ticket__c(Id = ticketId, DeletedDate__c = null));
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e); 
        }
    }

    /**
     * @description permanentdeleteticket Method
     * @param ticketId Id of Ticket__C Object
     */  
    @AuraEnabled
    public static void permanentdeleteticket(Id ticketId){
        try {
            Set<Id> cdId = new Set<Id>();
            List<ContentDocumentLink> cdllist = [SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =: ticketId WITH SECURITY_ENFORCED];
            for (ContentDocumentLink cdl : cdllist) {
                cdId.add(cdl.ContentDocumentId);
            }
            List<ContentDocument> cd = [SELECT Id FROM ContentDocument WHERE Id IN: cdId WITH SECURITY_ENFORCED];
            delete as User cd;
            delete as User (new Ticket__C(Id = ticketId));
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);   
        }
    }

    /**
     * @description getTicket Method
     * @param ticketId Id of Ticket__C Object
     * @return Record of Ticket__c Object
     */  
    @AuraEnabled
    public static Ticket__c getTicket(Id ticketId){
        try {
            Ticket__c ticketList = [SELECT Id, Name, TicketNumber__c,  TicketPriority__c, Field__r.Name, StartDate__c,EndDate__c,Description__c, CompletedPercentage__c, Field__c, Color__c,CreatedDate, LastModifiedDate FROM Ticket__c WHERE Id =: ticketId WITH SECURITY_ENFORCED];
            return ticketList;
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);  
            return null; 
        }
    }

    /**
        *@description create a wrapper for store Fields__C and Ticket__C value
    */
    public class FieldTicketwrapper{

        /**
            *@description wrapperclass variable to store fieldList record
        */
        @AuraEnabled
        public List<Fields__c> fieldList {get; set;}

        /**
            *@description wrapperclass variable to store ticketList record
        */
        @AuraEnabled
        public List<Ticket__c> ticketList {get; set;}
    }

    /**
     * @description uploadFile Method
     * @param base64 Base64 of the image
     * @param filename Name of the file
     * @param ticketId Id of Ticket__C Object
     * @return List of ContentVersion Object
     */  
    @AuraEnabled
    public static List<ContentVersion> uploadFile(String base64, String filename, String ticketId) {
        try {
            ContentVersion cv = new ContentVersion();
            cv.VersionData = EncodingUtil.base64Decode(base64);
            cv.Title = filename;
            cv.PathOnClient = filename;
            insert as User cv; 
            
            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id WITH SECURITY_ENFORCED].ContentDocumentId;
            cdl.LinkedEntityId = ticketId;
            cdl.ShareType = 'V';
            insert as User cdl;

            return retrieveFiles(ticketId);
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);  
            return null;
        }
    }

    /**
     * @description retrieveFiles Method
     * @param ticketId Id of Ticket__C Object
     * @return List of ContentVersion Object
     */ 
    @AuraEnabled
    public static List<ContentVersion> retrieveFiles(String ticketId){
        try {
            List<ContentDocumentLink> cdlList = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =: ticketId WITH SECURITY_ENFORCED];
            List<Id> cdIds = new List<Id>();
            for(ContentDocumentLink obj: cdlList){
                cdIds.add(obj.ContentDocumentId);
            }
            List<ContentVersion> cvList = [SELECT Id, ContentDocumentId, ContentUrl, VersionNumber, Title, PathOnClient, FileType, FileExtension, ContentSize, CreatedDate FROM ContentVersion WHERE ContentDocumentId IN:cdIds WITH SECURITY_ENFORCED];
            return cvList;        
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);  
            return null;
        }
    }    

    /**
     * @description deletefile Method
     * @param contentDocId Id of ContentDocument Object
     * @param ticketId Id of Ticket__C Object
     * @return List of ContentVersion Object
     */ 
    @AuraEnabled
    public static List<ContentVersion> deletefile( String contentDocId, String ticketId){
        try {
            delete as User (new ContentDocument (Id = contentDocId));
            return retrieveFiles(ticketId);
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);  
            return null;
        }
    }

    /**
     * @description getTicektsComment Method
     * @param ticketId Id of Ticket__C Object
     * @return List of Comment__c Object
     */ 
    @AuraEnabled
    public static List<Comment__c> getTicektsComment(Id ticketId){
        try {
            return [SELECT Id, Comments__c, CreatedDate, CreatedBy.Name FROM Comment__c WHERE Ticket__c =: ticketId WITH SECURITY_ENFORCED ORDER BY CreatedDate DESC ];
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);  
            return null;
        }
    }

    /**
     * @description saveComment Method
     * @param commentId Id of Comment__c Object
     * @param ticketId Id of Ticket__C Object
     * @param comment String to store in Comment__C Object
     * @return List of Comment__c Object
     */ 
    @AuraEnabled
    public static List<Comment__c> saveComment(Id commentId, Id ticketId, String comment){
        try {
            upsert as User ( new Comment__c (Id = commentId, Ticket__c = ticketId, Comments__c = comment));
            return [SELECT Id, Comments__c, CreatedDate, CreatedBy.Name FROM Comment__c WHERE Ticket__c =: ticketId WITH SECURITY_ENFORCED ORDER BY CreatedDate DESC ];
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);  
            return null;
        }
    }

    /**
     * @description deleteComment Method
     * @param commentId Id of Comment__c Object
     * @param ticketId Id of Ticket__C Object
     * @return List of Comment__c Object
     */ 
    @AuraEnabled
    public static List<Comment__c> deleteComment(Id commentId, Id ticketId){
        try {
            delete as User (new Comment__c ( Id = commentId));
            return [SELECT Id, Comments__c, CreatedDate, CreatedBy.Name FROM Comment__c WHERE Ticket__c =: ticketId WITH SECURITY_ENFORCED ORDER BY CreatedDate DESC ];
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);  
            return null;
        }
    }
}