@RestResource(urlMapping='/getBoard')
global class RestResourceClass {

@HttpGet
global static Board__c getAccount(){
    try{
        return [SELECT Id, Name FROM Board__c LIMIT 1];
    } catch(Exception e){
        return null;
    }
}
}