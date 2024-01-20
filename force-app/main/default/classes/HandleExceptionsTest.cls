@isTest
public with sharing class HandleExceptionsTest {

    @isTest
    static void handleExceptionsTest1() {
        try {
            Profile p = [SELECT id from profile WHERE Name='System Administrator'];
            User u = new User(
                alias = 'abc123xyz', 
                email='unit.test@email123.com',
                emailencodingkey='UTF-8',
                firstname='Sam',
                lastname='Franks', 
                languagelocalekey='en_US',
                localesidkey='en_GB', 
                profileid = p.Id,
                timezonesidkey='Europe/London', 
                username='unit.test@email123.com'
            );
            insert u;
            
            System.runAs(u) {
                integer i = 1/0;
                System.assertNotEquals(0, i, 'ok');
            }
        } catch (Exception e ) {
            HandleExceptions.handleExceptionsmethod(e);
        }
    }
}