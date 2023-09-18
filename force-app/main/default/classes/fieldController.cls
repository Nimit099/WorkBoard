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
    public static void createfield(Fields__c field, Integer fieldcount){
        try {
            if (field.OrderNumber__c == null) {
                field.OrderNumber__c = fieldcount + 1;
            }
            insert field;
        } catch (Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage());
        }
    }
}