@isTest
public with sharing class HandleExceptionsTest {

    @isTest
    static void HandleExceptionsTest() {
        try {
            integer i = 1/0;
        } catch (Exception e ) {
            HandleExceptions he = new HandleExceptions(e);
        }
    }
}