public with sharing class wordresscontroller {

    public static void sendemail(List<Contact> con){
        System.debug(con.size() + 'con');
        List<Id> conId = new List<Id>();
        for(Contact c : con){
            conId.add(c.Id);
        }
        System.debug(conId.size() + 'conId');
        List<ContentDocumentLink> attachedpdf = [SELECT ContentDocumentId, LinkedEntityId  FROM ContentDocumentLink where LinkedEntityId IN: conId];
        List<Id> cdId = new List<Id>();
        for(ContentDocumentLink condoc : attachedpdf){
            cdId.add(condoc.ContentDocumentId);
        }
        System.debug(cdId.size() + 'cdId');
        List<ContentVersion> conver = [SELECT Id, VersionData FROM Contentversion WHERE ContentDocumentId IN: cdId];
        System.debug(conver.size());
    }
}