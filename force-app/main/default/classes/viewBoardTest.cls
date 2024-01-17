@isTest
public with sharing class ViewBoardTest {
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
        List<Ticket__c> ticketList = new List<Ticket__c>();
        ticketList.add(t);
        ticketList.add(t1);
        insert ticketList;

        Profile p = [SELECT id from profile WHERE Name='System Administrator'];
        User u = new User(
            alias = 'abc', 
            email='unit.test@email123.com',
            emailencodingkey='UTF-8',
            firstname='Sam',
            lastname='Franks', 
            languagelocalekey='en_US',
            localesidkey='en_GB', 
            profileid = p.Id,
            timezonesidkey='Europe/London', 
            username='unit.test@email123.com',
            IsActive = true
        );
        insert u;
    }

    @isTest
    static void getBoardDataTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id FROM Board__c LIMIT 1];
            String s  = String.valueOf(ViewBoard.getBoardData(b.Id));
            System.assertEquals(null, s);
        }
    }

    @isTest
    static void getBoardDataTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id FROM Board__c LIMIT 1];
            String s  = String.valueOf(ViewBoard.getBoardData(b.Id));
            System.assertEquals(null, s);
        }
    }

    @isTest
    static void createticketTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            Ticket__c t  = ViewBoard.createticket(tic);
            System.assertEquals(tic.Name, t.Name);
        }
    }

    @isTest
    static void updateticketTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            tic.Name = 'Nameupdate';
            ViewBoard.updateticket(tic);
            Ticket__c t = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c WHERE Id =: tic.Id];
            System.assertEquals(tic.Name, t.Name);
        }
    }

    @isTest
    static void temporarydeleteticketTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            ViewBoard.temporarydeleteticket(tic.Id);
            Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
            System.assertEquals(System.today(), t.DeletedDate__c);
        }
    }

    @isTest
    static void temporarydeleteticketTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            ViewBoard.temporarydeleteticket(tic.Field__c);
            Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
            System.assertEquals(null, t.DeletedDate__c);
        }
    }

    @isTest
    static void restoreticketTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            ViewBoard.restoreticket(tic.Id);
            Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
            System.assertEquals(null, t.DeletedDate__c);
        }
    }

    @isTest
    static void updateticketfieldTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            ViewBoard.updateticketfield(tic.Id, tic.Field__c);
            Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
            System.assertEquals(null, t.DeletedDate__c);
        }
    }

    @isTest
    static void updateticketfieldTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            ViewBoard.updateticketfield(tic.Field__c, tic.Field__c);
            Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
            System.assertEquals(null, t.DeletedDate__c);
        }
    }

    @isTest
    static void restoreticketTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            ViewBoard.restoreticket(tic.Field__c);
            Ticket__c t = [SELECT Id,DeletedDate__c FROM Ticket__c WHERE Id =: tic.Id];
            System.assertEquals(null, t.DeletedDate__c);
        }
    }

    @isTest
    static void permanentdeleteticketTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            ViewBoard.permanentdeleteticket(tic.Id);
            Integer i = [SELECT Count() FROM Ticket__c];
            System.assertEquals(1, i);
        }
    }

    @isTest
    static void getTicketTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            Ticket__c t = ViewBoard.getTicket(tic.Id);
            System.assertEquals(tic.Name, t.Name);
        }
    }

    @isTest
    static void uploadFileTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            List<ContentVersion> cv = ViewBoard.uploadFile('xxx', 'Test', tic.Id);
            System.assertNotEquals(0, cv.size());
        }
    }

    @isTest
    static void uploadFileTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            List<ContentVersion> cv = ViewBoard.uploadFile('xxx', 'Test', 'xxx');
            System.assertEquals(null, cv);
        }
    }

    @isTest
    static void retrieveFiles() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            List<ContentVersion> cv = ViewBoard.retrieveFiles(tic.Id);
            System.assertEquals(0, cv.size());
        }
    }

    @isTest
    static void deletefileTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Test.startTest();
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            List<ContentVersion> cv = ViewBoard.deletefile(tic.Id, tic.Id);
            System.assertEquals(null, cv);
            Test.stopTest();
        }
    }

    @isTest
    static void getTicektsCommentTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            List<Comment__c> cv = ViewBoard.getTicektsComment(tic.Id);
            System.assertEquals(0, cv.size());
        }
    }

    @isTest
    static void saveCommentTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            List<Comment__c> cv = ViewBoard.saveComment(tic.Id,tic.Id, 'xxx');
            System.assertEquals(null, cv);
        }
    }

    @isTest
    static void deleteCommentTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Test.startTest();
            Ticket__c tic = [SELECT Id,TicketNumber__c,Name,Description__c,Field__c, StartDate__c,EndDate__c, TicketPriority__c, Color__c, CompletedPercentage__c FROM Ticket__c LIMIT 1];
            List<Comment__c> cv = ViewBoard.deleteComment(tic.Id, tic.Id);
            System.assertEquals(null, cv);
            Test.stopTest();
        }
    }
}