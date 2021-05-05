using { meineapp.db as meineapp } from '../db/datamodel';

@path: '/sap/opu/odata/sap/API_MA_PAT'

service myservice {
    entity MeineappSet as projection on meineapp.meineapp;
}