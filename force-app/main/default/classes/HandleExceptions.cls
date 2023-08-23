/*******************************************************
* Name          : HandleExceptions
* Author        : Nimit Shah
* Create Date   : 22/08/2022
* UsedBy        : Used by all the classes of WorkBoard 
* Description   : Call this class when exception occur in any other classes of WorkBoard
* Test Class    : 
*******************************************************/

public with sharing class HandleExceptions {

    /**
     * @description HandleExceptions Method
     * @param e It is Exception 
     */
    public HandleExceptions(Exception e) {
        try {
            
            String stackTrace = e.getStackTraceString().substringBefore('\n');
            String className = stackTrace.substringAfter('.').substringBefore('.');	
            String methodName = stackTrace.substringBefore(':').substringAfter(className).substringAfter('.');
    
            Error_Handler__c eh = new Error_Handler__c(
                Class_Name__c = classname,
                Method_Name__c = methodName,
                Exception_Message__c = e.getMessage(),
                Exception_Type__c = e.getTypeName(),
                Line_Number__c = e.getLineNumber(),
                More_Details__c = e.getStackTraceString()
            );

            insert as User eh;

        } catch (Exception error) {
            System.debug(error);
        }
            
    }
}