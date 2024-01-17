/*******************************************************
* Name          : FieldController
* Author        : Nimit Shah
* Create Date   : 01/01/2024
* UsedBy        : field.js, recyclepopup.js
* Description   : Use to perform CRUD operation on and related to Fields__C Object
* Test Class    : FieldControllerTest
*******************************************************/

/**
 * @description FieldController Class
 */
public with sharing class FieldController {
    
    /**
     * @description getFields Method
     * @param boardId Id of Board__C Object
     * @return List of Fields__c object
     */
    @AuraEnabled
    public static List<Fields__c> getFields (Id boardId) {
        try {
            return [SELECT Id, Name, OrderNumber__c, Board__c, DeletedDate__c FROM Fields__c WHERE Board__c =: boardId WITH SECURITY_ENFORCED ORDER BY OrderNumber__c ASC];
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);
            return null;
        }
    }

    /**
     * @description createfield Method
     * @param field Record of Fields__c Object
     * @param boardid Id of Board__C Object
     * @return List of Fields__c object
     */
    @AuraEnabled
    public static List<Fields__c> createfield(Fields__c field, Id boardid){
        try {
            List<Fields__c> fieldList = new List<Fields__c>();
            List<Fields__c> newfieldList = new List<Fields__c>();
            fieldList = [SELECT Id, Name, OrderNumber__c, DeletedDate__c FROM Fields__c WHERE Board__c =: boardid WITH SECURITY_ENFORCED ORDER BY OrderNumber__c ASC];

            if (field.OrderNumber__c == null || field.OrderNumber__c > fieldList.size()) {
                field.OrderNumber__c = fieldList.size() + 1;
                newfieldList = fieldList.clone();
                newfieldList.add(field);
            } else {
                for (Fields__c fields : fieldList) {
                    if (fields.OrderNumber__c >= field.OrderNumber__c) {
                        if(field.OrderNumber__c == fields.OrderNumber__c){
                            newfieldList.add(field);
                        } 
                        fields.OrderNumber__c += 1; 
                    }
                    newfieldList.add(fields);
                }
            }
            upsert as User newfieldList;
            return newfieldList;
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);
            return null;
        }
    }

    /**
     * @description temporarydeletefield Method
     * @param fieldid Id of Fields__c Object
     * @param boardid Id of Board__C Object
     * @return List of Fields__c object
     */
    @AuraEnabled
    public static List<Fields__c> temporarydeletefield(Id fieldid, Id boardid){
        try {
            Map<Id, Fields__c> fieldList = new Map<Id,Fields__c>([SELECT Id, Name, OrderNumber__c,DeletedDate__c FROM Fields__c WHERE Board__c =: boardid WITH SECURITY_ENFORCED ORDER BY OrderNumber__c ASC]);
            List<Fields__c> newfieldList = new List<Fields__c>();
            Integer i = (Integer)fieldList.get(fieldid).OrderNumber__c;
            fieldList.get(fieldid).OrderNumber__c = null;
            fieldList.get(fieldid).DeletedDate__c = System.today();

            for (Fields__c field : fieldList.values()) {
                if (field.OrderNumber__c > i ) {
                    field.OrderNumber__c -= 1;
                }
                newfieldList.add(field);
            }

            update as User newfieldList;
            return newfieldList;
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);
            return null;
        }
    }

    /**
     * @description permanentdeletefield Method
     * @param fieldid Id of Fields__c Object
     */
    @AuraEnabled
    public static void permanentdeletefield(Id fieldid){
        try {
            Set<Id> cdId = new Set<Id>();
            Set<Id> ticketId = new Set<Id>();

            List<Ticket__c> ticketlist = [SELECT Id FROM Ticket__c WHERE Field__c =: fieldid WITH SECURITY_ENFORCED];
            
            for (Ticket__c ticket : ticketlist) {
                ticketId.add(ticket.Id);
            }

            if (ticketId.size() > 0) {
                List<ContentDocumentLink> cdllist = [SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId IN: ticketId WITH SECURITY_ENFORCED];
                for (ContentDocumentLink cdl : cdllist) {
                    cdId.add(cdl.ContentDocumentId);
                }
                List<ContentDocument> cd = [SELECT Id FROM ContentDocument WHERE Id IN: cdId WITH SECURITY_ENFORCED];
                delete as User cd;
            }
            delete as User (new Fields__c(Id = fieldid));
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);
        }
    }

    /**
     * @description restoreFields Method
     * @param fieldId Id of Fields__c Object
     * @param boardId Id of Board__C Object
     * @return List of Fields__c object
     */
    @AuraEnabled
    public static List<Fields__c> restoreFields(Id fieldId, Id boardId){
        try {
            List<Fields__c> newfieldList = new List<Fields__c>();
            List<Fields__c> fieldList = new List< Fields__c>();
            fieldList = [SELECT Id, Name, OrderNumber__c,DeletedDate__c FROM Fields__c WHERE Board__c =: boardId WITH SECURITY_ENFORCED ORDER BY OrderNumber__c ASC];
            Integer index = 0;
            Integer i = 1;
            for (Fields__c fields : fieldList) {
                if (fields.Id == fieldId) {
                    index = fieldList.indexOf(fields);
                }

                if (fields.OrderNumber__c != null) {
                    i++;
                }
            }
            Fields__c field = fieldList.remove(index);
            field.OrderNumber__c = i;
            field.DeletedDate__c = null;
            newfieldList = fieldList.clone();
            newfieldList.add(field);
            
            update as User field;
            return newfieldList;
            
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);
            return null;
        }
    }

    /**
     * @description fieldPositionchange Method
     * @param dragfieldId Id of Fields__c Object
     * @param dropfieldId Id of Fields__c Object
     * @param boardId Id of Board__c Object
     * @return All fields returns of particular Board__c 
     */
    @AuraEnabled
    public static List<Fields__c> fieldPositionchange(Id dragfieldId, Id dropfieldId, Id boardId){
        try {

            Map<Id, Fields__c> fieldMap = new Map<Id, Fields__c>([SELECT Id, Name, OrderNumber__c,DeletedDate__c FROM Fields__c WHERE Board__c =: boardId AND OrderNumber__c != null WITH SECURITY_ENFORCED ORDER By OrderNumber__c ASC]);
            Integer dragfieldOrdernumber = (Integer)fieldMap.get(dragfieldId).OrderNumber__c;
            Integer dropfieldOrdernumber = (Integer)fieldMap.get(dropfieldId).OrderNumber__c;
            List<Fields__c> newfieldList = new List<Fields__c>();

            if (dragfieldOrdernumber > dropfieldOrdernumber) { // This mean I drag field from right side and drop it on left so fields get ++
                for (Fields__c fields : fieldMap.values()) {
                    if (fields.OrderNumber__c >= dropfieldOrdernumber && fields.OrderNumber__c < dragfieldOrdernumber) {
                        fields.OrderNumber__c += 1;                           
                    } else if (fields.OrderNumber__c == dragfieldOrdernumber){
                        fields.OrderNumber__c = dropfieldOrdernumber;
                    }
                    newfieldList.add(fields);
                }
            } else if(dragfieldOrdernumber < dropfieldOrdernumber){ // This mean I drag field from left side and drop it on right so fields get --
                for (Fields__c fields : fieldMap.values()) {
                    if (fields.OrderNumber__c <= dropfieldOrdernumber && fields.OrderNumber__c > dragfieldOrdernumber) {
                        fields.OrderNumber__c -= 1;                           
                    } else if (fields.OrderNumber__c == dragfieldOrdernumber){
                        fields.OrderNumber__c = dropfieldOrdernumber;
                    }
                    newfieldList.add(fields);
                }
            }

            update as User newfieldList;
            return[SELECT Id, Name, OrderNumber__c,DeletedDate__c FROM Fields__c WHERE Board__c =: boardId WITH SECURITY_ENFORCED ORDER By OrderNumber__c ASC];
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);
        }
        return null;
    }

        /**
     * @description renameField Method
     * @param fieldId Id of Field Object
     * @param newName New Name of Field Object
     */
    @AuraEnabled
    public static void renamefield(Id fieldId, String newName){
        try {
            Fields__c field = new Fields__c(Id = fieldId, Name = newName);
            update as User field;
        } catch (Exception e) {
            HandleExceptions.handleExceptionsmethod(e);
        }
    }
}