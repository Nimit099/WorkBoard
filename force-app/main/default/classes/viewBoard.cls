public class viewBoard {

    //It is call when someone create ticket
    @AuraEnabled
    public static Ticket__c createticket(Ticket__c newticket){
        try{
            Ticket__c ticket = new Ticket__c (TicketNumber__c = newticket.TicketNumber__c, Name = newticket.Name, Description__c = newticket.Description__c, StartDate__c  = newticket.StartDate__c, EndDate__c =  newticket.EndDate__c, TicketPriority__c  = newticket.TicketPriority__c, CreatedDate__c = System.today(), Field__c = newticket.Field__c, Color__c = newticket.Color__c);
            insert ticket;
            return ticket;
        } catch(Exception e){
            System.debug(e);
            return null; 
        }
    }

    // It is call when someone drag and drop ticket
    @AuraEnabled
    public static void updateticket(Id ticketId, Id fieldId){
        try{
        Database.upsert(new Ticket__c (Id = ticketId, Field__c = fieldId));
        } catch (Exception e){
            System.debug(e);
        }
    }

    @AuraEnabled
    public static void deleteticket(Id ticketId){
        Database.upsert(new Ticket__c(Id = ticketId, DeletedDate__c = System.today()));
    }

    @AuraEnabled
    public static void restoreticket(Id ticketId){
        Database.upsert(new Ticket__c(Id = ticketId, DeletedDate__c = null));
    }

      @AuraEnabled
    public static void permanentdeleteticket(Id ticketId){
        Database.delete(ticketId);
    }
}