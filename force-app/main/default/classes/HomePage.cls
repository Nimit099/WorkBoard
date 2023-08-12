public without sharing class HomePage {
    
    @AuraEnabled
    public static boarduserwrapper boards(){
        boarduserwrapper boarduserwrapper = new boarduserwrapper();
        try{
        List<Board__c> boards = [SELECT Id,Name,DeletedDate__c,CreatedDate,Description__c FROM Board__c order by LastModifiedDate asc];
        List<User__c> users = [SELECT Id, Name, Password__c, Email__c FROM User__c];
        List<Fields__c> fields = [SELECT Id, Name, OrderNumber__c, Board__c FROM Fields__c ORDER BY OrderNumber__c ASC];
        List<Ticket__c> tickets = [SELECT Id, Name, TicketPriority__c,CreatedDate,LastModifiedDate, Field__c, Field__r.Name,Color__c, Description__c, DeletedDate__c, CompletedPercentage__c,StartDate__c,EndDate__c,TicketNumber__c FROM Ticket__c order by LastModifiedDate asc];
        List<Comment__c> comments = [SELECT Id, Name,Comments__c,Ticket__c FROM Comment__c];
        List<BoardUserRelation__c> boarduserlimit = [SELECT Id, Name,Board__c, User__c FROM BoardUserRelation__c];

        // To delete the 15 day old deleted board
        List<Board__c> deleteboard = new List<Board__c>();
        List<Ticket__c> deleteticket = new List<Ticket__c>();
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
            delete deleteboard;
            // To delete the 15 day old deleted board
            //  To delete the 15 day old deleted ticket
           for(integer i = 0; i < tickets.size(); i++ ){
                if(tickets[i].DeletedDate__c != null){
                    endDate = date.newinstance( tickets[i].DeletedDate__c.year(),  tickets[i].DeletedDate__c.month(),  tickets[i].DeletedDate__c.day());
                    days = startDate.daysBetween( endDate );
                    if(days < -15){
                        deleteticket.add(tickets[i]);
                        tickets.remove(i);
                    }
                }
            }
            delete deleteticket;
        // To delete the 15 day old deleted ticket

            boarduserwrapper.boards = boards;
            boarduserwrapper.users = users;
            boarduserwrapper.tickets = tickets;
            boarduserwrapper.fields = fields;
            boarduserwrapper.comments = comments;
            boarduserwrapper.boarduserlimit = boarduserlimit;

         return boarduserwrapper;
        }
        catch(Exception e){
            boarduserwrapper.error = String.valueOf(e);
            return boarduserwrapper;
        }
    }

    @AuraEnabled
     public static Board__c createboard(Board__c board){
       Board__c newboard = new Board__c();
       newboard.Name = board.Name;
    //    newboard.CreatedDate__c =System.today();
       newboard.Description__c = board.Description__c;
       insert newboard;
       return newboard;
    }

    @AuraEnabled
    public static void deleteboard(Id boardId){
        try{
        Database.upsert(new Board__c(Id = boardId, DeletedDate__c = System.today())); 
        } catch(Exception e){
            System.debug(e);
        }
    }
     @AuraEnabled
    public static void restoreboard(Id boardId){
        try{
        Database.upsert(new Board__c(Id = boardId, DeletedDate__c = null)); 
        } catch(Exception e){
            System.debug(e);
        }
    }

    @AuraEnabled
    public static void permanentdeleteboard(Id boardId){
        try{
        Database.delete(boardId);
        } catch(Exception e){
            System.debug(e);
        }
    }

    public class boarduserwrapper{
        @AuraEnabled
        public List<User__c> users{get; set;}
         @AuraEnabled
        public List<Board__c> boards{get; set;}
         @AuraEnabled
        public List<Fields__c> fields{get; set;}
         @AuraEnabled
        public List<Ticket__C> tickets{get; set;}
         @AuraEnabled
        public List<Comment__c> comments{get; set;}
         @AuraEnabled
        public List<BoardUserRelation__c> boarduserlimit{get; set;}
          @AuraEnabled
        public String error{get; set;}
    }
}