@isTest
public with sharing class HomePageTest {
    @TestSetup
    static void boarddata(){
        Board__c b1 = new Board__c(Name = 'TestBoard', Description__c = 'T3est');
        Board__c b2 = new Board__c(Name = 'TestBoard', Description__c = 'T3est', DeletedDate__c = date.newInstance(1991, 2, 21));
        List<Board__c> bList = new List<Board__c>();
        bList.add(b1);
        bList.add(b2);
        insert bList;

        Fields__c f = new Fields__c(Name = 'Test', OrderNumber__c = 1, Board__c = bList[1].Id);
        insert f;

        Ticket__c t = new Ticket__c (TicketNumber__c = '101', Name = 'TIC', Description__c = 'TIC', StartDate__c  = System.today(), EndDate__c =  System.today(), TicketPriority__c  = 'High', Field__c = f.Id, Color__c = '#000000', CompletedPercentage__c = 100);
        insert t;

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
    static void getBoardsTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Test.startTest();
            Board__c b = [SELECT Id,Name FROM Board__c WHERE DeletedDate__c = null LIMIT 1 ];
            List<Board__c> bList = HomePage.getBoards();
            System.assertEquals(b.Id, bList[0].Id, 'ok');
            Test.stopTest();
        }
    }

    @isTest
    static void getBoardsTest1() {
        
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            delete [SELECT Id FROM Board__c];
            Test.startTest();
            List<Board__c> bList = HomePage.getBoards();
            System.assertEquals(0, bList.size(), 'ok');
            Test.stopTest();
        }
    }

    @isTest
    static void createboardTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id,Name, Description__c FROM Board__c WHERE DeletedDate__c = null LIMIT 1 ];
            Board__c newb = HomePage.createboard(b);
            System.assertEquals(b.Name, newb.Name, 'ok');
        }
    }

    @isTest
    static void searchBoardTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id,Name, Description__c FROM Board__c WHERE DeletedDate__c = null LIMIT 1 ];
            HomePage.searchBoard(null);
            List<Board__c> newb = HomePage.searchBoard(b.Name);
            System.assertEquals(b.Name, newb[0].Name, 'ok');
        }
    }

    @isTest
    static void deleteboardTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id,Name, Description__c FROM Board__c WHERE DeletedDate__c = null LIMIT 1 ];
            HomePage.deleteboard(b.Id);
            Board__c newb = [SELECT Id,Name, Description__c,DeletedDate__c FROM Board__c WHERE Id =: b.Id LIMIT 1 ];
            System.assertEquals( System.today(), newb.DeletedDate__c, 'ok');
        }
    }

    @isTest
    static void deleteboardTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id,Name, Description__c FROM Board__c WHERE DeletedDate__c = null LIMIT 1 ];
            delete b;
            HomePage.deleteboard(b.Id);
            List<Board__c> newb = [SELECT Id,Name, Description__c,DeletedDate__c FROM Board__c ];
            System.assertEquals( 1, newb.size(), 'ok');
        }
    }
    
    @isTest
    static void restoreboardTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id,Name, Description__c FROM Board__c WHERE DeletedDate__c = null LIMIT 1 ];
            HomePage.restoreboard(b.Id);
            Board__c newb = [SELECT Id,Name, Description__c,DeletedDate__c FROM Board__c WHERE Id =: b.Id LIMIT 1 ];
            System.assertEquals( null, newb.DeletedDate__c, 'ok');
        }
    }
    
    @isTest
    static void restoreboardTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id,Name, Description__c FROM Board__c WHERE DeletedDate__c = null LIMIT 1 ];
            delete b;
            HomePage.restoreboard(b.Id);
            List<Board__c> newb = [SELECT Id,Name, Description__c,DeletedDate__c FROM Board__c ];
            System.assertEquals( 1, newb.size(), 'ok');
        }
    }

    @isTest
    static void permanentdeleteboardTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id,Name, Description__c FROM Board__c WHERE DeletedDate__c != null LIMIT 1 ];
            HomePage.permanentdeleteboard(b.Id);
            List<Board__c> newb = [SELECT Id,Name, Description__c,DeletedDate__c FROM Board__c ];
            System.assertEquals( 1, newb.size(), 'ok');
        }
    }

    @isTest
    static void permanentdeleteboardTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id,Name, Description__c FROM Board__c WHERE DeletedDate__c = null LIMIT 1 ];
            delete b;
            HomePage.permanentdeleteboard(b.Id);
            List<Board__c> newb = [SELECT Id,Name, Description__c,DeletedDate__c FROM Board__c ];
            System.assertEquals( 1, newb.size(), 'ok');
        }
    }

    @isTest
    static void userconfigTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            List<WorkBoardMeta__mdt> wbmdt = HomePage.userconfig();
            System.assertEquals(12, wbmdt.size(), 'ok');
        }
    }

}