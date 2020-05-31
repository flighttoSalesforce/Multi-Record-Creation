import { LightningElement, track, wire, api} from 'lwc';
import contactRecords from '@salesforce/apex/MultiRecordCreationHandler.getRelatedContacts';
import deleteContactHandler from '@salesforce/apex/MultiRecordCreationHandler.deleteContactHandler';
import insertContactData from '@salesforce/apex/MultiRecordCreationHandler.saveContactData';
import { getRecord } from 'lightning/uiRecordApi';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';

export default class MultiRecordCreation extends LightningElement {
    @track contactDataWrp;
    @track blankRow = [];
    @track disabledCheckbox = true;
    @track index = 0;
    @track selectedAccount;
    @track accountName;


    @wire(getRecord, { recordId: '$selectedAccount', fields: [ ACCOUNT_NAME_FIELD ] })
    savedRecordIdWire({error,data}) {
        if(data){
            this.accountName = data.fields.Name.value;
        }else if(error){
            window.alert(JSON.stringify(error));
        }
    }

    handleAccountId(event){
        let accountId = event.detail.value[0];
        if(accountId !== undefined){
            this.selectedAccount = accountId;
            this.contactDataWrp = [];
           contactRecords({accId : accountId}).then(result => {
                this.contactDataWrp = result;
                this.index = result.length;
            }).catch(error => {
                console.log(error);
            })
        }else{
           this.blankRow = []; 
           this.index = 0;
           this.contactDataWrp = [];
        }
    }

    deleteRecord(event){
        const selectedContact = this.contactDataWrp[event.target.value];
        window.alert(JSON.stringify(this.contactDataWrp) + ' & ' + event.target.value + ' & ' + JSON.stringify(selectedContact));
        deleteContactHandler({conId: selectedContact.Id, accId: selectedContact.AccountId}).then(result => {
            this.contactDataWrp = result;
        }).catch(error => {
            window.alert(JSON.stringify(error));
        })
    }

    addRow(event){
        this.index++;
        let i = this.index;
        let newContact = new Object();
        let blankRow = this.blankRow;
        newContact.Id = i;
        newContact.isChecked = false;
        blankRow.push(newContact);
        this.blankRow = blankRow; 
    }

    removeRow(event){
        const eventName = event.target.name;
        let blankRow = this.blankRow;
        if(eventName === 'multipleRowRemoval'){
            for(let i = 0; i < blankRow.length; i++){
                if(blankRow[i].isChecked){
                    blankRow.splice(i, 1);
                    i--;
                }
            }
        }else{
            blankRow.splice(event.target.value, 1);
        }
        this.blankRow = blankRow;
    }

    setFirstName(event){
        const eventName = event.target.name;
        let blankRow = this.blankRow;
        blankRow[eventName].FirstName = event.target.value;
        this.blankRow = blankRow;
    }

    setLastName(event){
        const eventName = event.target.name;
        let blankRow = this.blankRow;
        blankRow[eventName].LastName = event.target.value;
        this.blankRow = blankRow;
    }

    saveData(event){
        let blankRow = this.blankRow;
        let contactDataList = [];
        for(let i = 0; i < blankRow.length; i++){
            if(blankRow[i] !== undefined && blankRow[i].isChecked){
                let conData = new Object();
                conData.AccountId = this.selectedAccount;
                conData.FirstName = blankRow[i].FirstName;
                conData.LastName = blankRow[i].LastName;
                contactDataList.push(conData);
            }
        }
        if(contactDataList.length > 0){
            insertContactData({contactDataString: JSON.stringify(contactDataList)}).then(result => {
                let newContactList = this.contactDataWrp;
                for(let i = 0; i < result.length; i++){
                    if(result[i] !== undefined){
                        let contactRecord = {'sobjectType' : 'Contact'};
                        contactRecord.Id = result[i].Id;
                        contactRecord.FirstName = result[i].FirstName;
                        contactRecord.LastName = result[i].LastName;
                        contactRecord.AccountId = this.selectedAccount;
                        newContactList.push(contactRecord);
                    }
                }
                this.contactDataWrp = newContactList;
                this.blankRow = []; 
                this.index = newContactList.length;
            }).catch(error => {
                window.alert('Please contact system admin: ' + JSON.stringify(error));
            })
        }else{
            window.alert('Please select any row to insert data.');
        }
    }

    setCheckBox(event){
        let blankrow = this.blankRow;
        if(blankrow[event.target.name].isChecked){
            blankrow[event.target.name].isChecked = false;
        }else{
            blankrow[event.target.name].isChecked = true;
        }
        this.blankRow = blankrow;
    }
}