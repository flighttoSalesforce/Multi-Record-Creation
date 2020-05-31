public with sharing class MultiRecordCreationHandler {
    @AuraEnabled
    public static List<Contact> getRelatedContacts(Id accId){
        return [Select Id, FirstName, LastName, Account.Name from Contact where AccountId = :accId];
    }

    @AuraEnabled
    public static List<Contact> deleteContactHandler(Id conId, Id accId){
        Database.delete(conId);
        return [Select Id, FirstName, LastName, AccountId, Account.Name from Contact where AccountId = :accId];
    }

    @AuraEnabled
    public static List<Contact> saveContactData(String contactDataString){
        List<Contact> contactList = (List<Contact>)System.JSON.deserializeStrict(contactDataString, List<Contact>.Class);
        Database.insert(contactList);
        return contactList;
    }
}
