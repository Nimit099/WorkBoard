public with sharing class fieldController {
    
    @AuraEnabled
    public static List<Fields__c> getFields (Id boardId) {
        try {
            return [SELECT Id, Name, OrderNumber__c, Board__c, DeletedDate__c FROM Fields__c WHERE Board__c =: boardId ORDER BY OrderNumber__c ASC];
        } catch (Exception e) {
            System.debug(e);
            return null;
        }
    }

    @AuraEnabled
    public static List<Fields__c> createfield(Fields__c field, Id boardid){
        try {
            List<Fields__c> fieldList = new List<Fields__c>();
            fieldList = [SELECT Id, Name, OrderNumber__c, DeletedDate__c FROM Fields__c WHERE Board__c =: boardid ORDER BY OrderNumber__c ASC];
            if (field.OrderNumber__c == null) {
                field.OrderNumber__c = fieldList.get(fieldList.size() -1).OrderNumber__c + 1;
                fieldList.add(field);
            } else {
                Integer n ;
                for (Integer i = 0; i < fieldList.size(); i++) {
                    if ( fieldList[i].OrderNumber__c >=  field.OrderNumber__c ) {
                        if (fieldList[i].OrderNumber__c ==  field.OrderNumber__c) {
                            n = i;
                        }
                        fieldList[i].OrderNumber__c += 1;
                    }
                }
                fieldList.add(n, field);
            }
            upsert as User fieldList;
            return fieldList;
        } catch (Exception e) {
            System.debug(e);
            HandleExceptions eh = new HandleExceptions(e);
            return null;
        }
    }

    @AuraEnabled
    public static List<Fields__c> temporarydeletefield(Id fieldid, Id boardid){
        try {
            List<Fields__c> fieldList = new List<Fields__c>();
            fieldList = [SELECT Id, Name, OrderNumber__c,DeletedDate__c FROM Fields__c WHERE Board__c =: boardid ORDER BY OrderNumber__c ASC];
            
            Boolean deletedfield = false;
            for (Fields__c field : fieldList) {
                if (field.OrderNumber__c != null && field.DeletedDate__c == null) {
                    if (field.Id != fieldid) {
                        if (deletedfield) {
                            field.OrderNumber__c = field.OrderNumber__c - 1;
                        }
                    } else {
                        field.DeletedDate__c = System.today();
                        field.OrderNumber__c = null;
                        deletedfield = true;
                    }
                }
            }
    
            update as User fieldList;
            return fieldList;
        } catch (Exception e) {
            System.debug(e);
            HandleExceptions eh = new HandleExceptions(e);
            return null;
        }
    }

    @AuraEnabled
    public static void permanentdeletefield(Id fieldid){
        try {
            delete (new Fields__c(Id = fieldid));
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);
            System.debug(e);
        }
    }
}