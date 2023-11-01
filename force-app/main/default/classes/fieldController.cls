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
            List<Fields__c> newfieldList = new List<Fields__c>();
            fieldList = [SELECT Id, Name, OrderNumber__c, DeletedDate__c FROM Fields__c WHERE Board__c =: boardid ORDER BY OrderNumber__c ASC];

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
            System.debug(e);
            HandleExceptions eh = new HandleExceptions(e);
            return null;
        }
    }

    @AuraEnabled
    public static List<Fields__c> temporarydeletefield(Id fieldid, Id boardid){
        try {
            Map<Id, Fields__c> fieldList = new Map<Id,Fields__c>([SELECT Id, Name, OrderNumber__c,DeletedDate__c FROM Fields__c WHERE Board__c =: boardid ORDER BY OrderNumber__c ASC]);
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

    @AuraEnabled
    public static List<Fields__c> restoreFields(Id fieldId, Id boardId){
        try {
            List<Fields__c> newfieldList = new List<Fields__c>();
            List<Fields__c> fieldList = new List< Fields__c>();
            fieldList = [SELECT Id, Name, OrderNumber__c,DeletedDate__c FROM Fields__c WHERE Board__c =: boardId ORDER BY OrderNumber__c ASC];
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
            HandleExceptions eh = new HandleExceptions(e);
            System.debug(e);
            return null;
        }
    }

    @AuraEnabled
    public static List<Fields__c> fieldPositionchange(Id dragfieldId, Id dropfieldId, Id boardId){
        try {

            Map<Id, Fields__c> fieldMap = new Map<Id, Fields__c>([SELECT Id, Name, OrderNumber__c,DeletedDate__c FROM Fields__c WHERE Board__c =: boardId AND OrderNumber__c != null ORDER By OrderNumber__c ASC]);
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
            return[SELECT Id, Name, OrderNumber__c,DeletedDate__c FROM Fields__c WHERE Board__c =: boardId ORDER By OrderNumber__c ASC];
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);
            System.debug(e);
        }
        return null;
    }

    @AuraEnabled
    public static void renamefield(Id fieldId, String newName){
        try {
            update as user (new Fields__c(Id = fieldId, Name = newName));
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);
            System.debug(e);
        }
    }
}