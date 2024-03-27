/*******************************************************
* Name          : HandleExceptions
* Author        : Nimit Shah
* Create Date   : 22/08/2022
* UsedBy        : Used by all the classes of WorkBoard 
* Description   : Call this class when exception occur in any other classes of WorkBoard
* Test Class    : HandleExceptionTest
*******************************************************/

/**
 * @description HandleExceptions Class
 */
public with sharing class HandleExceptions {

    /**
     * @description HandleExceptions Method
     * @param e It is Exception 
     */
    public static void handleExceptionsmethod(Exception e) {

        String stackTrace = e.getStackTraceString().substringBefore('\n');
        String className = stackTrace.substringAfter('GB_24.').substringBefore('.');	
        String methodName = stackTrace.substringBefore(':').substringAfter(className).substringAfter('.');
        Error_Handler__c eh = new Error_Handler__c();
        try {            
            eh.Class_Name__c = classname;
            eh.Method_Name__c = methodName;
            eh.Exception_Message__c = e.getMessage();
            eh.Exception_Type__c = e.getTypeName();
            eh.Line_Number__c = e.getLineNumber();
            eh.More_Details__c = e.getStackTraceString();

            insert as User eh;

        } catch (Exception error) {
            eh.Class_Name__c = 'HandleExceptions';
            insert as User eh;
        }
    }
}