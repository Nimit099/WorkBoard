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

            List<Board__c> boards = [SELECT Id,Name,DeletedDate__c,CreatedDate,Description__c FROM Board__c WITH SECURITY_ENFORCED order by LastModifiedDate asc];
            List<Ticket__c> tickets = [SELECT Id, Name, TicketPriority__c,CreatedDate,LastModifiedDate, Field__c, Field__r.Name,Color__c, Description__c, DeletedDate__c, CompletedPercentage__c,StartDate__c,EndDate__c,TicketNumber__c FROM Ticket__c WHERE DeletedDate__c < LAST_N_DAYS:15 WITH SECURITY_ENFORCED order by LastModifiedDate asc ];

            // List<Fields__c> fields = [SELECT Id, Name, OrderNumber__c, Board__c FROM Fields__c ORDER BY OrderNumber__c ASC];
            // List<Comment__c> comments = [SELECT Id, Name,Comments__c,Ticket__c FROM Comment__c];

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
            delete deleteboard;             // To delete the 15 day old deleted board.

            delete tickets;                 // To delete the 15 day old deleted ticket.
           
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
                delete as User b;
        } catch(Exception e){
            HandleExceptions eh = new HandleExceptions(e);
            System.debug(e);
        }
    }

}