@isTest
public with sharing class fieldControllerTest {
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
    }

    @isTest
    static void getFieldsTest() {
        Board__c b = [SELECT Id FROM Board__c LIMIT 1];
        Integer fieldcount = [SELECT Count() FROM Fields__c WHERE Board__c =: b.Id];
        List<Fields__c> f = fieldController.getFields(b.Id);
        System.assertEquals(fieldcount, f.size());
    }

    @isTest
    static void createfieldTest() {
        Board__c b = [SELECT Id FROM Board__c LIMIT 1];
        Fields__c field = [SELECT Id, Board__c,OrderNumber__c FROM Fields__c LIMIT 1];
        field.OrderNumber__c = null;
        List<Fields__c> f = fieldController.createfield(field, b.Id);
        System.assertEquals(null, f);

    }

    @isTest
    static void createfieldTest1() {
        Board__c b = [SELECT Id FROM Board__c LIMIT 1];
        Fields__c f = new Fields__c(Name = 'Test', OrderNumber__c = 1, Board__c = b.Id);
        List<Fields__c> flist = fieldController.createfield(f, b.Id);
        System.assertEquals(3, flist.size());
    }

    @isTest
    static void temporarydeletefieldTest() {
        Fields__c f = [SELECT Id, Board__c, DeletedDate__c FROM Fields__c LIMIT 1];
        List<Fields__c> flist = fieldController.temporarydeletefield(f.Id, f.Board__c);
        System.assertNotEquals(f.DeletedDate__c, flist[1].DeletedDate__c);
    }

    @isTest
    static void permanentdeletefieldTest() {
        Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
        fieldController.permanentdeletefield(f.Id);
        List<Fields__c> flist = [SELECT Id FROM Fields__c];
        System.assertEquals(1, flist.size());
    }

    @isTest
    static void permanentdeletefieldTest1() {
        Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
        delete f;
        fieldController.permanentdeletefield(f.Id);
        List<Fields__c> flist = [SELECT Id FROM Fields__c];
        System.assertEquals(1, flist.size());
    }

    @isTest
    static void restoreFieldsTest() {
        Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
        List<Fields__c> flist = fieldController.restoreFields(f.Id, f.Board__c);
        System.assertEquals(2, flist.size());

    }

    @isTest
    static void renamefieldTest() {
        Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
        fieldController.renamefield(f.Id, 'Test1');
        Fields__c flist = [SELECT Id, Name FROM Fields__c WHERE Id =: f.Id];
        System.assertEquals('Test1', flist.Name);
    }

    @isTest
    static void renamefieldTest1() {
        Fields__c f = [SELECT Id, Board__c FROM Fields__c LIMIT 1];
        delete f;
        fieldController.renamefield(f.Id, 'Test');
        Fields__c flist = [SELECT Id, Name FROM Fields__c WHERE Id !=: f.Id];
        System.assertEquals('Test', flist.Name);
    }
    
    @isTest
    static void fieldPositionchangeTest() {
        List<Fields__c> fieldList = [SELECT Id, Board__c FROM Fields__c];
        List<Fields__c> flist = fieldController.fieldPositionchange(fieldList[0].Id, fieldList[1].Id, fieldList[0].Board__c);
        System.assertEquals(fieldList.size(), flist.size());
    }
}