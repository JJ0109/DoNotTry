namespace meineapp.db;

using { managed } from '@sap/cds/common';

entity meineapp : managed
{
    vorname : String not null;
    nachname : String not null;
    strasse : String not null;
    hausnummer : Integer not null;
    geburtsdatum : Date not null;
    geschlecht : String not null;
    key versicherungsnummer : String;
    key usernummer : String;
    telefonnummer : String not null;
    email : String not null;
    key patientennummer : String;
    anrede : String;
    postleitzahl : String;
    ort : String;
    land : String;
    zusatz : String;
    handynummer : String; 
    postfach : String;
    fax : String;
}
