public class viewBoard {

    @AuraEnabled
    public static FieldTicketwrapper getBoardData(Id boardId){
        try {
            List<Fields__c> fieldList = [SELECT Id, Name, OrderNumber__c, Board__c FROM Fields__c  WHERE Board__c =: boardId WITH SECURITY_ENFORCED ORDER BY OrderNumber__c ASC];
            List<Ticket__c> ticketList = [SELECT Id, Name, TicketNumber__c, TicketPriority__c, DeletedDate__c, Field__c, Color__c, CreatedDate FROM Ticket__c WHERE Field__c IN: fieldList WITH SECURITY_ENFORCED];

            FieldTicketwrapper ftw = new FieldTicketwrapper();
            ftw.fieldList = fieldList;
            ftw.ticketList = ticketList;
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
            Ticket__c ticket = new Ticket__c (TicketNumber__c = newticket.TicketNumber__c, Name = newticket.Name, Description__c = newticket.Description__c, StartDate__c  = newticket.StartDate__c, EndDate__c =  newticket.EndDate__c, TicketPriority__c  = newticket.TicketPriority__c, Field__c = newticket.Field__c, Color__c = newticket.Color__c);
            insert ticket;
            return ticket;
        } catch(Exception e){
            System.debug(e);
            HandleExceptions eh = new HandleExceptions(e);
            return null; 
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
            Database.delete(ticketId);
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);   
        }
    }

    public class FieldTicketwrapper{
        @AuraEnabled
        public List<Fields__c> fieldList {get; set;}
        @AuraEnabled
        public List<Ticket__c> ticketList {get; set;}
    }
}