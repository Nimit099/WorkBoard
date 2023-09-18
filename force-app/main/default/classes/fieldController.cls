public with sharing class fieldController {
    
    @AuraEnabled
    public static List<Fields__c> getFields (Id boardId) {
        try {
            return [SELECT Id, Name, OrderNumber__c FROM Fields__c WHERE Board__c =: boardId ORDER BY OrderNumber__c ASC];
        } catch (Exception e) {
            System.debug(e);
            return null;
        }
    }

    @AuraEnabled
    public static List<Fields__c> createfield(Fields__c field, Id boardid){
        try {
            List<Fields__c> fieldList = new List<Fields__c>();
            fieldList = [SELECT Id, Name, OrderNumber__c FROM Fields__c WHERE Board__c =: boardid ORDER BY OrderNumber__c ASC];
            if (field.OrderNumber__c == null) {
                field.OrderNumber__c = fieldList.size() + 1;
                fieldList.add(field);
            } else {
                Integer n = 0;
                Integer newFieldIndex = null; 
                for (Fields__c fields : fieldList) {
                    if (fields.OrderNumber__c ==  field.OrderNumber__c) {
                        newFieldIndex = n;
                        n = (Integer)fields.OrderNumber__c;
                    }
                    n++;
                    fields.OrderNumber__c = n;
                }
                if (newFieldIndex != null) {
                    fieldList.add(newFieldIndex, field);
                } else {
                    fieldList.add(field);
                }
            }
            upsert fieldList;
            return fieldList;
        } catch (Exception e) {
            System.debug(e);
            HandleExceptions eh = new HandleExceptions(e);
            return null;
        }
    }
}