/*******************************************************
* Name          : HomePage
* Author        : Nimit Shah
* Create Date   : 12/08/2022
* UsedBy        : Used by home.js 
* Description   : Use this class to do CRUD Operation on Board Object
* Test Class    : 
*******************************************************/
public with sharing class HomePage {
    
     /**
     * @description getBoards Method
     * @return boards It returns List of Board__c 
     */
    @AuraEnabled
    public static List<Board__c> getBoards(){

        try{

            
            List<Board__c> boards = [SELECT Id,Name,DeletedDate__c,CreatedDate,Description__c FROM Board__c WITH SECURITY_ENFORCED order by CreatedDate asc];
            List<Ticket__c> tickets = [SELECT Id, DeletedDate__c FROM Ticket__c WHERE DeletedDate__c < LAST_N_DAYS:15 WITH SECURITY_ENFORCED ];
            List<Fields__c> fields =  [SELECT Id, DeletedDate__c FROM Fields__c WHERE DeletedDate__c < LAST_N_DAYS:15 WITH SECURITY_ENFORCED ];
          
            // To delete the 15 day old deleted board
            List<Board__c> deleteboard = new List<Board__c>();

            Date startDate = Date.today();
            Date endDate;
            Integer days;
            
            for(integer i = 0; i < boards.size(); i++ ){
                if(boards[i].DeletedDate__c != null){
                    endDate = date.newinstance( boards[i].DeletedDate__c.year(),  boards[i].DeletedDate__c.month(),  boards[i].DeletedDate__c.day());
                    days = startDate.daysBetween( endDate );
                    if(days < -15){
                        deleteboard.add(boards[i]);
                        boards.remove(i);
                    }
                }
            }
            delete as User deleteboard;             // To delete the 15 day old deleted board.
            delete as User fields;                  // To delete the 15 day old deleted field.
            delete as User tickets;                 // To delete the 15 day old deleted ticket.
            
            return boards;
        }
        catch(Exception e){
            HandleExceptions eh = new HandleExceptions(e);
            return null;
        }
    }

    /**
     * @description createboard Method
     * @param board Record of Board__c Object
     * @return newboard It returns Board__c 
     */
    @AuraEnabled
     public static Board__c createboard(Board__c board){
        try {

            Board__c newboard = new Board__c();
            newboard.Name = board.Name;
            newboard.Description__c = board.Description__c;

            insert as User newboard;
            
            return newboard;

        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);
            return null;
        }
    }

         /**
     * @description deleteboard Method
     * @param searchkey Id of Board__c
     * @Return boards It is List of Board__c
     */
    @AuraEnabled
    public static List<Board__c> searchBoard(String searchkey){
        try{

            List<Board__c> boards = new List<Board__c>(); 
            if (searchkey != null) {
                searchkey = '%' + searchkey + '%';
                boards = [SELECT Id,Name,DeletedDate__c,CreatedDate,Description__c FROM Board__c WHERE Name LIKE: searchkey AND DeletedDate__c =: null WITH SECURITY_ENFORCED order by LastModifiedDate asc];
            } else {
                boards = [SELECT Id,Name,DeletedDate__c,CreatedDate,Description__c FROM Board__c WHERE DeletedDate__c =: null WITH SECURITY_ENFORCED order by LastModifiedDate asc];
            }
            return boards;

        } catch(Exception e){
            HandleExceptions eh = new HandleExceptions(e);
            return null;
        }
    }


     /**
     * @description deleteboard Method
     * @param boardId Id of Board__c
     */
    @AuraEnabled
    public static void deleteboard(Id boardId){
        try{

            Board__c deleteboard = new Board__c (Id = boardId, DeletedDate__c = System.today());
            upsert as User deleteboard;
            
        } catch(Exception e){
            HandleExceptions eh = new HandleExceptions(e);
        }
    }

     /**
     * @description restoreboard Method
     * @param boardId Id of Board__c
     */
    @AuraEnabled
    public static void restoreboard(Id boardId){
        try{

            Board__c restoreboard = new Board__c (Id = boardId, DeletedDate__c = null);
            upsert as User restoreboard;

        } catch(Exception e){
            HandleExceptions eh = new HandleExceptions(e);
        }
    }

     /**
     * @description permanentdeleteboard Method
     * @param boardId Id of Board__c
     */
    @AuraEnabled
    public static void permanentdeleteboard(Id boardId){
        try{
                Board__c b = new Board__c(Id = boardId);
                List<Fields__c> fieldList = [SELECT Id FROM Fields__c WHERE Board__c =: boardId];
                List<Ticket__c> ticketList = [SELECT Id FROM Ticket__c WHERE Field__c IN: fieldList];
                Set<Id> cdId = new Set<Id>();
                Set<Id> ticketId = new Set<Id>();   
                for (Ticket__c ticket : ticketlist) {
                    ticketId.add(ticket.Id);
                }
    
                if (ticketId.size() > 0) {
                    List<ContentDocumentLink> cdllist = [SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId IN: ticketId];
                    for (ContentDocumentLink cdl : cdllist) {
                        cdId.add(cdl.ContentDocumentId);
                    }
                    List<ContentDocument> cd = [SELECT Id FROM ContentDocument WHERE Id IN: cdId];
                    Database.delete(cd);
                }
                delete as User b;
        } catch(Exception e){
            HandleExceptions eh = new HandleExceptions(e);
        }
    }

    @AuraEnabled
    public static List<WorkBoardMeta__mdt> userconfig(){
        try {
            return [SELECT Id, Label, ImageName__c, UserDescription__c FROM WorkBoardMeta__mdt Order By Label ASC];
        } catch (Exception e) {
            HandleExceptions eh = new HandleExceptions(e);
            return null;
        }
    }

}