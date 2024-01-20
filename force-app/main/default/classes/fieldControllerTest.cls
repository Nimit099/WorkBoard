@isTest
public with sharing class FieldControllerTest {
    @TestSetup
    static void fieldData(){
        Board__c b1 = new Board__c(Name = 'TestBoard', Description__c = 'T3est');
        insert b1;
        Fields__c f = new Fields__c(Name = 'Test', OrderNumber__c = 1, Board__c = b1.Id);
        Fields__c f1 = new Fields__c(Name = 'Test', OrderNumber__c = 2, Board__c = b1.Id, DeletedDate__c = date.newInstance(1991, 2, 21));
        List<Fields__c> fieldList = new List<Fields__c>();
        fieldList.add(f1);
        fieldList.add(f);
        insert fieldList;

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
    static void getFieldsTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id FROM Board__c LIMIT 1];
            Integer fieldcount = [SELECT Count() FROM Fields__c WHERE Board__c =: b.Id];
            List<Fields__c> f = FieldController.getFields(b.Id);
            System.assertEquals(fieldcount, f.size(), 'Ok');
        }
    }

    @isTest
    static void createfieldTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id FROM Board__c LIMIT 1];
            Fields__c field = [SELECT Id, Board__c,OrderNumber__c FROM Fields__c LIMIT 1];
            field.OrderNumber__c = null;
            List<Fields__c> f = FieldController.createfield(field, b.Id);
            System.assertEquals(null, f, 'ok');
        }
    }

    @isTest
    static void createfieldTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Board__c b = [SELECT Id FROM Board__c LIMIT 1];
            Fields__c f = new Fields__c(Name = 'Test', OrderNumber__c = 1, Board__c = b.Id);
            List<Fields__c> flist = FieldController.createfield(f, b.Id);
            System.assertEquals(3, flist.size(), 'ok');
        }
    }

    @isTest
    static void temporarydeletefieldTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Fields__c f = [SELECT Id, Board__c, DeletedDate__c FROM Fields__c LIMIT 1];
            List<Fields__c> flist = FieldController.temporarydeletefield(f.Id, f.Board__c);
            System.assertNotEquals(f.DeletedDate__c, flist[1].DeletedDate__c, 'ok');
        }
    }

    @isTest
    static void permanentdeletefieldTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
            FieldController.permanentdeletefield(f.Id);
            List<Fields__c> flist = [SELECT Id FROM Fields__c];
            System.assertEquals(1, flist.size(), 'ok');
        }
    }

    @isTest
    static void permanentdeletefieldTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
            delete f;
            FieldController.permanentdeletefield(f.Id);
            List<Fields__c> flist = [SELECT Id FROM Fields__c];
            System.assertEquals(1, flist.size(), 'ok');
        }
    }

    @isTest
    static void restoreFieldsTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
            List<Fields__c> flist = FieldController.restoreFields(f.Id, f.Board__c);
            System.assertEquals(2, flist.size(), 'ok');
        }
    }

    @isTest
    static void renamefieldTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
            FieldController.renamefield(f.Id, 'Test1');
            Fields__c flist = [SELECT Id, Name FROM Fields__c WHERE Id =: f.Id];
            System.assertEquals('Test1', flist.Name, 'ok');
        }
    }

    @isTest
    static void renamefieldTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
            delete f;
            FieldController.renamefield(f.Id, 'Test');
            Fields__c flist = [SELECT Id, Name FROM Fields__c WHERE Id !=: f.Id];
            System.assertEquals('Test', flist.Name, 'ok');
        }
    }
    
    @isTest
    static void fieldPositionchangeTest() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            List<Fields__c> fieldList = [SELECT Id, Board__c FROM Fields__c Order by OrderNumber__c ASC];
            List<Fields__c> flist = FieldController.fieldPositionchange(fieldList[0].Id, fieldList[1].Id, fieldList[0].Board__c);
            System.assertEquals(fieldList.size(), flist.size(), 'ok');
        }
    }

    @isTest
    static void fieldPositionchangeTest1() {
        User u = [SELECT Id FROM User WHERE Profile.Name = 'System Administrator' AND IsActive = true LIMIT 1];
        System.runAs(u) {
            List<Fields__c> fieldList = [SELECT Id, Board__c FROM Fields__c Order by OrderNumber__c DESC];
            List<Fields__c> flist = FieldController.fieldPositionchange(fieldList[0].Id, fieldList[1].Id, fieldList[0].Board__c);
            System.assertEquals(fieldList.size(), flist.size(), 'ok');
        }
    }
}