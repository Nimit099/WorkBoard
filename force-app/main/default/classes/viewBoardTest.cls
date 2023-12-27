@isTest
public with sharing class viewBoardTest {
    @TestSetup
    static void ticketData(){
        Board__c b1 = new Board__c(Name = 'TestBoard', Description__c = 'T3est');
        insert b1;
        Fields__c f = new Fields__c(Name = 'Test', OrderNumber__c = 1, Board__c = b1.Id);
        Fields__c f1 = new Fields__c(Name = 'Test', OrderNumber__c = 2, Board__c = b1.Id, DeletedDate__c = date.newInstance(1991, 2, 21));
        List<Fields__c> fieldList = new List<Fields__c>();
        fieldList.add(f1);
        fieldList.add(f);
        insert fieldList;

        Ticket__c t = new Ticket__c (TicketNumber__c = '101', Name = 'TIC', Description__c = 'TIC', StartDate__c  = System.today(), EndDate__c =  System.today(), TicketPriority__c  = 'High', Field__c = fieldList[0].Id, Color__c = '#000000', CompletedPercentage__c = 100);
        Ticket__c t1 = new Ticket__c (TicketNumber__c = '101', Name = 'TIC', Description__c = 'TIC', StartDate__c  = System.today(), EndDate__c =  System.today(), TicketPriority__c  = 'High', Field__c = fieldList[1].Id, Color__c = '#000000', CompletedPercentage__c = 100);
        List<Ticket__c> TicketList = new List<Ticket__c>();
        TicketList.add(t);
        TicketList.add(t1);
        insert TicketList;
    }

    @isTest
    static void getBoardDataTest() {
        Board__c b = [SELECT Id FROM Board__c LIMIT 1];
        String s  = String.valueOf(viewBoard.getBoardData(b.Id));
        System.assertEquals(null, s);
    }

    @isTest
    static void getBoardDataTest1() {
        Board__c b = [SELECT Id FROM Board__c LIMIT 1];
        String s  = String.valueOf(viewBoard.getBoardData(b.Id));
        System.assertEquals(null, s);
    }

    @isTest
    static void createticketTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        Ticket__c t  = viewBoard.createticket(tic);
        System.assertEquals(tic.Name, t.Name);
    }

    @isTest
    static void updateticketTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        tic.Name = 'Nameupdate';
        viewBoard.updateticket(tic);
        Ticket__c t = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c WHERE Id =: tic.Id];
        System.assertEquals(tic.Name, t.Name);
    }

    @isTest
    static void temporarydeleteticketTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        viewBoard.temporarydeleteticket(tic.Id);
        Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
        System.assertEquals(System.today(), t.DeletedDate__c);
    }

    @isTest
    static void temporarydeleteticketTest1() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        viewBoard.temporarydeleteticket(tic.Field__c);
        Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
        System.assertEquals(null, t.DeletedDate__c);
    }

    @isTest
    static void restoreticketTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        viewBoard.restoreticket(tic.Id);
        Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
        System.assertEquals(null, t.DeletedDate__c);
    }

    @isTest
    static void updateticketfieldTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        viewBoard.updateticketfield(tic.Id, tic.Field__c);
        Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
        System.assertEquals(null, t.DeletedDate__c);
    }

    @isTest
    static void updateticketfieldTest1() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        viewBoard.updateticketfield(tic.Field__c, tic.Field__c);
        Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
        System.assertEquals(null, t.DeletedDate__c);
    }

    @isTest
    static void restoreticketTest1() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        viewBoard.restoreticket(tic.Field__c);
        Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
        System.assertEquals(null, t.DeletedDate__c);
    }

    @isTest
    static void permanentdeleteticketTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        viewBoard.permanentdeleteticket(tic.Id);
        Integer i = [SELECT Count() FROM Ticket__c];
        System.assertEquals(1, i);
    }

    @isTest
    static void getTicketTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        Ticket__c t = viewBoard.getTicket(tic.Id);
        System.assertEquals(tic.Name, t.Name);
    }

    @isTest
    static void uploadFileTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        List<ContentVersion> cv = viewBoard.uploadFile('xxx', 'Test', tic.Id);
        System.assertNotEquals(0, cv.size());
    }

    @isTest
    static void uploadFileTest1() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        List<ContentVersion> cv = viewBoard.uploadFile('xxx', 'Test', 'xxx');
        System.assertEquals(null, cv);
    }

    @isTest
    static void retrieveFiles() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        List<ContentVersion> cv = viewBoard.retrieveFiles(tic.Id);
        System.assertEquals(0, cv.size());
    }

    @isTest
    static void deletefileTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        List<ContentVersion> cv = viewBoard.deletefile(tic.Id, tic.Id);
        System.assertEquals(0, cv.size());
    }

    @isTest
    static void getTicektsCommentTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        List<Comment__c> cv = viewBoard.getTicektsComment(tic.Id);
        System.assertEquals(0, cv.size());
    }

    @isTest
    static void saveCommentTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        List<Comment__c> cv = viewBoard.saveComment(tic.Id,tic.Id, 'xxx');
        System.assertEquals(null, cv);
    }

    @isTest
    static void deleteCommentTest() {
        Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
        List<Comment__c> cv = viewBoard.deleteComment(tic.Id, tic.Id);
        System.assertEquals(0, cv.size());
    }
}